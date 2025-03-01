import { PrismaClient, Rental } from "@prisma/client";
import { Request, Response } from "express";
import redisClient from "../config/redis";

const prisma = new PrismaClient();
class RentalsController {
  async index(req: Request, res: Response) {
    const {
      query,
      page = 1,
      startedDate,
      endDate,
    } = req.query as unknown as {
      query: string;
      page: number;
      startedDate: Date;
      endDate: Date;
    };

    const cacheKey = `rentals:${query}:${page}:${startedDate}:${endDate}`;
    const cachedRents = await redisClient.get(cacheKey);

    if (cachedRents) {
      return res.json({ data: JSON.parse(cachedRents) });
    }

    let rents;

    try {
      if (query || startedDate || endDate) {
        rents = await prisma.rental.findMany({
          where: {
            OR: [
              { car: { name: { contains: query, mode: "insensitive" } } },
              { user: { name: { contains: query, mode: "insensitive" } } },
              { user: { email: { contains: query, mode: "insensitive" } } },
            ],
            startDate: startedDate ? { gte: startedDate } : undefined,
            endDate: endDate ? { lte: endDate } : undefined,
          },
          take: 10,
          skip: (page - 1) * 10,
          include: { car: true, user: true },
          orderBy: { createdAt: "desc" },
        });
      } else {
        rents = await prisma.rental.findMany({
          take: 10,
          skip: (page - 1) * 10,
          include: { car: true, user: true },
          orderBy: { createdAt: "desc" },
        });
      }

      await redisClient.set(cacheKey, JSON.stringify(rents), {
        EX: 3600,
      });

      res.json({ data: rents });
    } catch (error) {
      console.error("Error when getting rentals:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async show(req: Request, res: Response) {
    try {
      const { rentalId } = req.params;
      const cacheKey = `rental:${rentalId}`;
      const cachedRent = await redisClient.get(cacheKey);

      if (cachedRent) {
        return res.json({ data: JSON.parse(cachedRent) });
      }

      const rent = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: { car: true, user: true },
      });

      if (!rent) {
        return res.status(404).json({ message: "Rental not found" });
      }

      await redisClient.set(cacheKey, JSON.stringify(rent), {
        EX: 3600,
      });

      res.json({ data: rent });
    } catch (error) {
      console.error("Error when getting rental:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async store(req: Request, res: Response) {
    let { carId, quantity, price, startDate, endDate } = req.body as Pick<
      Rental,
      "carId" | "quantity" | "price" | "startDate" | "endDate"
    >;

    const currentUser = req.user as { id: string };

    const car = await prisma.car.findUnique({ where: { id: carId } });
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!car || !user) {
      return res.status(404).json({ message: "Car or user not found" });
    }

    if (car.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Not enough quantity of cars available" });
    }

    price =
      (Number(car.price) *
        Number(quantity) *
        (new Date(endDate).getTime() - new Date(startDate).getTime())) /
      86400000;

    const rental = await prisma.rental.create({
      data: {
        carId,
        userId: currentUser.id,
        quantity: Number(quantity),
        price,
        startDate,
        endDate,
      },
    });

    await prisma.car.update({
      where: { id: carId },
      data: { quantity: car.quantity - quantity },
    });

    await redisClient.del(`rentals:*`);

    res
      .status(201)
      .json({ message: "Rental created successfully", data: rental });
  }

  async update(req: Request, res: Response) {
    const { rentalId } = req.params;
    const currentUser = req.user as { id: string };
    const { startDate, endDate } = req.body as Pick<
      Rental,
      "startDate" | "endDate"
    >;

    const rent = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { user: true, car: true },
    });

    if (!rent) {
      return res.status(404).json({ message: "Rental not found" });
    }

    if (currentUser.id !== rent.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (rent.status === "active") {
      return res.status(400).json({ message: "Can't update active rental" });
    }

    if (startDate && endDate) {
      const oneHourBeforeStart = new Date(
        rent.startDate.getTime() - 60 * 60 * 1000
      );

      if (startDate < oneHourBeforeStart) {
        return res.status(400).json({
          message:
            "Can't update rental less than 1 hour before current start date",
        });
      }

      const rentDifference =
        new Date(endDate).getTime() - new Date(startDate).getTime();

      const dbRentDifference =
        new Date(rent.endDate).getTime() - new Date(rent.startDate).getTime();

      if (rentDifference !== dbRentDifference) {
        return res.status(400).json({
          message: "End date must be after start date",
        });
      }
    }

    const updatedRental = await prisma.rental.update({
      where: { id: rentalId },
      data: {
        startDate,
        endDate,
      },
    });

    await redisClient.del(`rental:${rentalId}`);
    await redisClient.del(`rentals:*`);

    res.json({ message: "Rental updated successfully", data: updatedRental });
  }

  async destroy(req: Request, res: Response) {
    const { rentalId } = req.params;
    const currentUser = req.user as { id: string };

    const rent = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { user: true },
    });

    if (!rent) {
      return res.status(404).json({ message: "Rental not found" });
    }

    if (currentUser.id !== rent.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (rent.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only can cancel pending rentals" });
    }

    await prisma.rental.delete({ where: { id: rentalId } });

    await prisma.car.update({
      where: { id: rent.carId },
      data: { quantity: { increment: rent.quantity } },
    });

    await redisClient.del(`rental:${rentalId}`);
    await redisClient.del(`rentals:*`);

    res.json({ message: "Rental deleted successfully" });
  }

  async showByUser(req: Request, res: Response) {
    const { userId } = req.params;
    const currentUser = req.user as { id: string };

    const cacheKey = `rentals:user:${userId}`;
    const cachedRents = await redisClient.get(cacheKey);

    if (cachedRents) {
      return res.json({ data: JSON.parse(cachedRents) });
    }

    const rents = await prisma.rental.findMany({
      where: { userId },
      include: { car: true, user: true },
    });

    if (currentUser.id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await redisClient.set(cacheKey, JSON.stringify(rents), {
      EX: 3600,
    });

    res.json({ data: rents });
  }
}

export default new RentalsController();
