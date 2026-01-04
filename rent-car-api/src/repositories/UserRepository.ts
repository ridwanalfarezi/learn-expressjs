import { PrismaClient, User } from "@prisma/client";
import { DatabaseError, NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateUserInput {
  email: string;
  name: string;
  role?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

export interface UserFilterOptions {
  query?: string;
  page?: number;
  take?: number;
}

/**
 * User Repository - Handles all user data access operations
 */
export class UserRepository {
  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new DatabaseError("Failed to find user", error);
    }
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      throw new DatabaseError("Failed to find user by email", error);
    }
  }

  /**
   * Find many users with optional filtering and pagination
   */
  async findMany(options: UserFilterOptions = {}): Promise<User[]> {
    try {
      const { query = "", page = 1, take = 10 } = options;
      const skip = (page - 1) * take;

      if (query) {
        return await prisma.user.findMany({
          where: {
            role: "customer",
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
          take,
          skip,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      }

      return await prisma.user.findMany({
        where: { role: "customer" },
        take,
        skip,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to fetch users", error);
    }
  }

  /**
   * Create a new user
   */
  async create(input: CreateUserInput): Promise<User> {
    try {
      return await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: input.role || "customer",
        },
      });
    } catch (error) {
      // Handle unique constraint violation
      if ((error as any).code === "P2002") {
        throw new DatabaseError("Email already exists", error);
      }
      throw new DatabaseError("Failed to create user", error);
    }
  }

  /**
   * Update a user
   */
  async update(id: string, input: UpdateUserInput): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data: input,
      });
    } catch (error) {
      if ((error as any).code === "P2025") {
        throw new NotFoundError("User not found", "User", id);
      }
      if ((error as any).code === "P2002") {
        throw new DatabaseError("Email already exists", error);
      }
      throw new DatabaseError("Failed to update user", error);
    }
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<User> {
    try {
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if ((error as any).code === "P2025") {
        throw new NotFoundError("User not found", "User", id);
      }
      throw new DatabaseError("Failed to delete user", error);
    }
  }

  /**
   * Check if user exists by ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true },
      });
      return !!user;
    } catch (error) {
      throw new DatabaseError("Failed to check user existence", error);
    }
  }
}

export const userRepository = new UserRepository();
