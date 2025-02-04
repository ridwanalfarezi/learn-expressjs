import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();
class CarsController {
  async index(req: Request, res: Response) {
    const { query, page = 1 } = req.query as unknown as {
      query: string;
      page: number;
    };
    let cars;

    if (query) {
      cars = await prisma.car.findMany({
        where: {
          name: { contains: query },
        },
        take: 10,
        skip: (page - 1) * 10,
      });
    } else {
      cars = await prisma.car.findMany({
        take: 10,
        skip: (page - 1) * 10,
      });
    }

    res.json({ data: cars });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json({ data: car });
  }

  async store(req: Request, res: Response) {
    const car = await prisma.car.create({
      data: {
        ...req.body,
        image: req.file ? req.file.path : null,
        price: Number(req.body.price),
        quantity: Number(req.body.quantity),
      },
    });
    res.json({ message: "Car created successfully", data: car });
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    const updatedCar = await prisma.car.update({
      where: { id },
      data: {
      ...req.body,
      image: req.file ? req.file.path : car.image,
      price: Number(req.body.price),
      quantity: Number(req.body.quantity),
      },
    });
    res.json({ message: "Car updated successfully", data: updatedCar });
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    await prisma.car.delete({ where: { id } });
    res.json({ message: "Car deleted successfully" });
  }
}

export default new CarsController();
