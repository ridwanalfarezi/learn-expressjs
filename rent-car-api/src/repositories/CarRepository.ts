import { Car, PrismaClient } from "@prisma/client";
import { DatabaseError, NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateCarInput {
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface UpdateCarInput {
  name?: string;
  brand?: string;
  price?: number;
  quantity?: number;
  image?: string;
}

export interface CarFilterOptions {
  query?: string;
  page?: number;
  take?: number;
}

/**
 * Car Repository - Handles all car data access operations
 */
export class CarRepository {
  /**
   * Find a car by ID
   */
  async findById(id: string): Promise<Car | null> {
    try {
      return await prisma.car.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new DatabaseError("Failed to find car", error);
    }
  }

  /**
   * Find many cars with optional filtering and pagination
   */
  async findMany(options: CarFilterOptions = {}): Promise<Car[]> {
    try {
      const { query = "", page = 1, take = 10 } = options;
      const skip = (page - 1) * take;

      if (query) {
        return await prisma.car.findMany({
          where: {
            name: { contains: query, mode: "insensitive" },
          },
          take,
          skip,
        });
      }

      return await prisma.car.findMany({
        take,
        skip,
      });
    } catch (error) {
      throw new DatabaseError("Failed to fetch cars", error);
    }
  }

  /**
   * Create a new car
   */
  async create(input: CreateCarInput): Promise<Car> {
    try {
      return await prisma.car.create({
        data: {
          name: input.name,
          brand: input.brand,
          price: input.price,
          quantity: input.quantity,
          image: input.image,
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to create car", error);
    }
  }

  /**
   * Update a car
   */
  async update(id: string, input: UpdateCarInput): Promise<Car> {
    try {
      return await prisma.car.update({
        where: { id },
        data: input,
      });
    } catch (error) {
      if ((error as any).code === "P2025") {
        throw new NotFoundError("Car not found", "Car", id);
      }
      throw new DatabaseError("Failed to update car", error);
    }
  }

  /**
   * Delete a car
   */
  async delete(id: string): Promise<Car> {
    try {
      return await prisma.car.delete({
        where: { id },
      });
    } catch (error) {
      if ((error as any).code === "P2025") {
        throw new NotFoundError("Car not found", "Car", id);
      }
      throw new DatabaseError("Failed to delete car", error);
    }
  }

  /**
   * Decrease car quantity
   */
  async decreaseQuantity(id: string, amount: number): Promise<Car> {
    try {
      return await prisma.car.update({
        where: { id },
        data: { quantity: { decrement: amount } },
      });
    } catch (error) {
      if ((error as any).code === "P2025") {
        throw new NotFoundError("Car not found", "Car", id);
      }
      throw new DatabaseError("Failed to update car quantity", error);
    }
  }

  /**
   * Increase car quantity
   */
  async increaseQuantity(id: string, amount: number): Promise<Car> {
    try {
      return await prisma.car.update({
        where: { id },
        data: { quantity: { increment: amount } },
      });
    } catch (error) {
      if ((error as any).code === "P2025") {
        throw new NotFoundError("Car not found", "Car", id);
      }
      throw new DatabaseError("Failed to update car quantity", error);
    }
  }

  /**
   * Check if car exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const car = await prisma.car.findUnique({
        where: { id },
        select: { id: true },
      });
      return !!car;
    } catch (error) {
      throw new DatabaseError("Failed to check car existence", error);
    }
  }
}

export const carRepository = new CarRepository();
