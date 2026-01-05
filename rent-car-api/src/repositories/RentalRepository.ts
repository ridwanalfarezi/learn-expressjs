import { Rental } from "@prisma/client";
import { DatabaseError, NotFoundError } from "../utils/errors";

import prisma from "../utils/prismaClient";

export interface CreateRentalInput {
  userId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  quantity: number;
  price: number;
}

export interface UpdateRentalInput {
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

export interface RentalFilterOptions {
  query?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  take?: number;
}

/**
 * Rental Repository - Handles all rental data access operations
 */
export class RentalRepository {
  /**
   * Find a rental by ID
   */
  async findById(id: string): Promise<Rental | null> {
    try {
      return await prisma.rental.findUnique({
        where: { id },
        include: { car: true, user: true },
      });
    } catch (error) {
      throw new DatabaseError("Failed to find rental", error);
    }
  }

  /**
   * Find many rentals with optional filtering and pagination
   */
  async findMany(options: RentalFilterOptions = {}): Promise<Rental[]> {
    try {
      const { query = "", startDate, endDate, page = 1, take = 10 } = options;
      const skip = (page - 1) * take;

      const where: any = {};

      if (query) {
        where.OR = [
          { car: { name: { contains: query, mode: "insensitive" } } },
          { user: { name: { contains: query, mode: "insensitive" } } },
          { user: { email: { contains: query, mode: "insensitive" } } },
        ];
      }

      if (startDate) {
        where.startDate = { gte: startDate };
      }

      if (endDate) {
        where.endDate = { lte: endDate };
      }

      return await prisma.rental.findMany({
        where,
        take,
        skip,
        include: { car: true, user: true },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw new DatabaseError("Failed to fetch rentals", error);
    }
  }

  /**
   * Find rentals by user ID
   */
  async findByUserId(userId: string): Promise<Rental[]> {
    try {
      return await prisma.rental.findMany({
        where: { userId },
        include: { car: true, user: true },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw new DatabaseError("Failed to fetch user rentals", error);
    }
  }

  /**
   * Create a new rental
   */
  async create(input: CreateRentalInput): Promise<Rental> {
    try {
      return await prisma.rental.create({
        data: {
          userId: input.userId,
          carId: input.carId,
          startDate: input.startDate,
          endDate: input.endDate,
          quantity: input.quantity,
          price: input.price,
        },
        include: { car: true, user: true },
      });
    } catch (error) {
      if ((error as any).code === "P2003") {
        throw new DatabaseError("Invalid car or user reference", error);
      }
      throw new DatabaseError("Failed to create rental", error);
    }
  }

  /**
   * Update a rental
   */
  async update(id: string, input: UpdateRentalInput): Promise<Rental> {
    try {
      return await prisma.rental.update({
        where: { id },
        data: input,
        include: { car: true, user: true },
      });
    } catch (error) {
      if ((error as any).code === "P2025") {
        throw new NotFoundError("Rental not found", "Rental", id);
      }
      throw new DatabaseError("Failed to update rental", error);
    }
  }

  /**
   * Delete a rental
   */
  async delete(id: string): Promise<Rental> {
    try {
      return await prisma.rental.delete({
        where: { id },
        include: { car: true, user: true },
      });
    } catch (error) {
      if ((error as any).code === "P2025") {
        throw new NotFoundError("Rental not found", "Rental", id);
      }
      throw new DatabaseError("Failed to delete rental", error);
    }
  }

  /**
   * Check if rental exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const rental = await prisma.rental.findUnique({
        where: { id },
        select: { id: true },
      });
      return !!rental;
    } catch (error) {
      throw new DatabaseError("Failed to check rental existence", error);
    }
  }
}

export const rentalRepository = new RentalRepository();
