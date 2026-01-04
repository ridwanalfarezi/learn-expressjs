import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { safeRedisDel, safeRedisGet, safeRedisSet } from "../config/redis";

const prisma = new PrismaClient();

class UsersController {
  async index(req: Request, res: Response) {
    let { query, page = 1 } = req.query as unknown as {
      query: string;
      page: number;
    };

    // Validate and sanitize inputs
    const sanitizedQuery = query?.trim().substring(0, 100) || "";
    const validatedPage = Math.max(
      1,
      Math.min(parseInt(page as any) || 1, 1000)
    );

    if (sanitizedQuery && sanitizedQuery.length < 2) {
      return res
        .status(400)
        .json({ message: "Query must be at least 2 characters" });
    }

    const cacheKey = `users:${sanitizedQuery}:${validatedPage}`;
    const cachedUsers = await safeRedisGet(cacheKey);

    if (cachedUsers) {
      return res.json({ data: JSON.parse(cachedUsers) });
    }

    let users;
    if (sanitizedQuery) {
      users = await prisma.user.findMany({
        where: {
          role: "customer",
          OR: [
            { name: { contains: sanitizedQuery, mode: "insensitive" } },
            { email: { contains: sanitizedQuery, mode: "insensitive" } },
          ],
        },
        take: 10,
        skip: (validatedPage - 1) * 10,
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
        skip: (validatedPage - 1) * 10,
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    }

    await safeRedisSet(cacheKey, JSON.stringify(users), {
      EX: 3600, // Expire in 1 hour
    });

    res.json({ data: users });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    const cacheKey = `user:${id}`;
    const cachedUser = await safeRedisGet(cacheKey);

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

    await safeRedisSet(cacheKey, JSON.stringify(user), {
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
    await safeRedisDel(`users:*`);

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
    await safeRedisDel(`user:${id}`);
    await safeRedisDel(`users:*`);

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
    await safeRedisDel(`user:${id}`);
    await safeRedisDel(`users:*`);

    res.json({ message: "User deleted successfully" });
  }
}

export default new UsersController();
