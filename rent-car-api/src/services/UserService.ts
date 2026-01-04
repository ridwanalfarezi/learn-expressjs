import { User } from "@prisma/client";
import {
  CreateUserInput,
  UpdateUserInput,
  userRepository,
} from "../repositories";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors";
import { cacheService } from "./CacheService";

export interface UserServiceFilterOptions {
  query?: string;
  page?: number;
}

/**
 * User Service - Contains business logic for user operations
 * Orchestrates repositories and external services
 */
export class UserService {
  /**
   * Get all users with caching
   */
  async getAllUsers(options: UserServiceFilterOptions = {}): Promise<User[]> {
    const { query = "", page = 1 } = options;

    // Try to get from cache
    const cacheKey = cacheService.generateUsersKey(query, page);
    const cachedUsers = await cacheService.get<User[]>(cacheKey);

    if (cachedUsers) {
      return cachedUsers;
    }

    // Fetch from repository
    const users = await userRepository.findMany({
      query,
      page,
      take: 10,
    });

    // Store in cache
    await cacheService.set(cacheKey, users);

    return users;
  }

  /**
   * Get user by ID with caching
   */
  async getUserById(userId: string): Promise<User> {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError("User ID is required", "userId");
    }

    // Try to get from cache
    const cacheKey = cacheService.generateUserKey(userId);
    const cachedUser = await cacheService.get<User>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    // Fetch from repository
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(
        `User with ID ${userId} not found`,
        "User",
        userId
      );
    }

    // Store in cache
    await cacheService.set(cacheKey, user);

    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    if (!email || email.trim().length === 0) {
      throw new ValidationError("Email is required", "email");
    }

    return await userRepository.findByEmail(email);
  }

  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput): Promise<User> {
    // Validate input
    this.validateUserInput(input);

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError("A user with this email already exists", "email");
    }

    // Create user
    const user = await userRepository.create(input);

    // Invalidate users list cache
    await cacheService.invalidateUserCaches();

    return user;
  }

  /**
   * Update a user
   */
  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError("User ID is required", "userId");
    }

    // Verify user exists
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundError(`User not found`, "User", userId);
    }

    // Validate input
    if (input.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        throw new ValidationError("Invalid email format", "email");
      }

      // Check if new email already exists (and is not the current email)
      if (input.email !== existingUser.email) {
        const userWithEmail = await userRepository.findByEmail(input.email);
        if (userWithEmail) {
          throw new ConflictError("Email is already in use", "email");
        }
      }
    }

    if (input.name && input.name.trim().length < 3) {
      throw new ValidationError(
        "Name must be at least 3 characters long",
        "name"
      );
    }

    // Update user
    const updatedUser = await userRepository.update(userId, input);

    // Invalidate caches
    await cacheService.invalidateUserCaches(userId);

    return updatedUser;
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<User> {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError("User ID is required", "userId");
    }

    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User not found`, "User", userId);
    }

    // Delete user
    const deletedUser = await userRepository.delete(userId);

    // Invalidate caches
    await cacheService.invalidateUserCaches(userId);

    return deletedUser;
  }

  /**
   * Validate user input
   */
  private validateUserInput(input: CreateUserInput): void {
    if (!input.email || input.email.trim().length === 0) {
      throw new ValidationError("Email is required", "email");
    }

    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError("Name is required", "name");
    }

    if (input.name.trim().length < 3) {
      throw new ValidationError(
        "Name must be at least 3 characters long",
        "name"
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new ValidationError("Invalid email format", "email");
    }
  }
}

export const userService = new UserService();
