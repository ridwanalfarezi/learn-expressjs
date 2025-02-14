import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import redisClient from "../config/redis";

const prisma = new PrismaClient();

class UsersController {
  async index(req: Request, res: Response) {
    const { query, page = 1 } = req.query as unknown as {
      query: string;
      page: number;
    };

    const cacheKey = `users:${query}:${page}`;
    const cachedUsers = await redisClient.get(cacheKey);

    if (cachedUsers) {
      return res.json({ data: JSON.parse(cachedUsers) });
    }

    let users;
    if (query) {
      users = await prisma.user.findMany({
        where: {
          role: "customer",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
        skip: (page - 1) * 10,
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    } else {
      users = await prisma.user.findMany({
        where: {
          role: "customer",
        },
        take: 10,
        skip: (page - 1) * 10,
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    }

    await redisClient.set(cacheKey, JSON.stringify(users), {
      EX: 3600, // Expire in 1 hour
    });

    res.json({ data: users });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    const cacheKey = `user:${id}`;
    const cachedUser = await redisClient.get(cacheKey);

    if (cachedUser) {
      return res.json({ data: JSON.parse(cachedUser) });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await redisClient.set(cacheKey, JSON.stringify(user), {
      EX: 3600, // Expire in 1 hour
    });

    res.json({ data: user });
  }

  async store(req: Request, res: Response) {
    const { name, email } = req.body as { name: string; email: string };

    const user = await prisma.user.create({
      data: { name, email, role: "customer" },
    });

    // Clear cache for users list
    await redisClient.del(`users:*`);

    res.json({ message: "User created successfully", data: user });
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email } = req.body as { name: string; email: string };

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email },
    });

    // Clear cache for this user and users list
    await redisClient.del(`user:${id}`);
    await redisClient.del(`users:*`);

    res.json({ message: "User updated successfully", data: updatedUser });
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({ where: { id } });

    // Clear cache for this user and users list
    await redisClient.del(`user:${id}`);
    await redisClient.del(`users:*`);

    res.json({ message: "User deleted successfully" });
  }
}

export default new UsersController();
