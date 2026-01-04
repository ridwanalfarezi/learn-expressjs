import { Car } from "@prisma/client";
import { carRepository, CreateCarInput, UpdateCarInput } from "../repositories";
import {
  BusinessLogicError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";
import { cacheService } from "./CacheService";

export interface CarServiceFilterOptions {
  query?: string;
  page?: number;
}

/**
 * Car Service - Contains business logic for car operations
 * Orchestrates repositories and external services
 */
export class CarService {
  /**
   * Get all cars with caching
   */
  async getAllCars(options: CarServiceFilterOptions = {}): Promise<Car[]> {
    const { query = "", page = 1 } = options;

    // Try to get from cache
    const cacheKey = cacheService.generateCarsKey(query, page);
    const cachedCars = await cacheService.get<Car[]>(cacheKey);

    if (cachedCars) {
      return cachedCars;
    }

    // Fetch from repository
    const cars = await carRepository.findMany({
      query,
      page,
      take: 10,
    });

    // Store in cache
    await cacheService.set(cacheKey, cars);

    return cars;
  }

  /**
   * Get car by ID with caching
   */
  async getCarById(carId: string): Promise<Car> {
    if (!carId || carId.trim().length === 0) {
      throw new ValidationError("Car ID is required", "carId");
    }

    // Try to get from cache
    const cacheKey = cacheService.generateCarKey(carId);
    const cachedCar = await cacheService.get<Car>(cacheKey);

    if (cachedCar) {
      return cachedCar;
    }

    // Fetch from repository
    const car = await carRepository.findById(carId);

    if (!car) {
      throw new NotFoundError(`Car with ID ${carId} not found`, "Car", carId);
    }

    // Store in cache
    await cacheService.set(cacheKey, car);

    return car;
  }

  /**
   * Create a new car
   */
  async createCar(input: CreateCarInput): Promise<Car> {
    // Validate input
    this.validateCarInput(input);

    // Create car
    const car = await carRepository.create(input);

    // Invalidate cars list cache
    await cacheService.invalidateCarCaches();

    return car;
  }

  /**
   * Update a car
   */
  async updateCar(carId: string, input: UpdateCarInput): Promise<Car> {
    if (!carId || carId.trim().length === 0) {
      throw new ValidationError("Car ID is required", "carId");
    }

    // Verify car exists
    const existingCar = await carRepository.findById(carId);
    if (!existingCar) {
      throw new NotFoundError(`Car not found`, "Car", carId);
    }

    // Validate input if provided
    if (Object.keys(input).length > 0) {
      this.validateCarUpdateInput(input);
    }

    // Update car
    const updatedCar = await carRepository.update(carId, input);

    // Invalidate caches
    await cacheService.invalidateCarCaches(carId);

    return updatedCar;
  }

  /**
   * Delete a car
   */
  async deleteCar(carId: string): Promise<Car> {
    if (!carId || carId.trim().length === 0) {
      throw new ValidationError("Car ID is required", "carId");
    }

    // Verify car exists
    const car = await carRepository.findById(carId);
    if (!car) {
      throw new NotFoundError(`Car not found`, "Car", carId);
    }

    // Delete car
    const deletedCar = await carRepository.delete(carId);

    // Invalidate caches
    await cacheService.invalidateCarCaches(carId);

    return deletedCar;
  }

  /**
   * Get available quantity for a car
   */
  async getAvailableQuantity(carId: string): Promise<number> {
    const car = await this.getCarById(carId);
    return car.quantity;
  }

  /**
   * Check if sufficient quantity is available
   */
  async hasSufficientQuantity(
    carId: string,
    requiredQuantity: number
  ): Promise<boolean> {
    const car = await this.getCarById(carId);
    return car.quantity >= requiredQuantity;
  }

  /**
   * Reserve car quantity (decrease)
   */
  async reserveQuantity(carId: string, quantity: number): Promise<Car> {
    if (quantity <= 0) {
      throw new ValidationError("Quantity must be greater than 0", "quantity");
    }

    const car = await this.getCarById(carId);

    if (car.quantity < quantity) {
      throw new BusinessLogicError(
        `Insufficient car quantity. Available: ${car.quantity}, Requested: ${quantity}`
      );
    }

    const updatedCar = await carRepository.decreaseQuantity(carId, quantity);

    // Invalidate cache after quantity change
    await cacheService.invalidateCarCaches(carId);

    return updatedCar;
  }

  /**
   * Release car quantity (increase)
   */
  async releaseQuantity(carId: string, quantity: number): Promise<Car> {
    if (quantity <= 0) {
      throw new ValidationError("Quantity must be greater than 0", "quantity");
    }

    const updatedCar = await carRepository.increaseQuantity(carId, quantity);

    // Invalidate cache after quantity change
    await cacheService.invalidateCarCaches(carId);

    return updatedCar;
  }

  /**
   * Validate car input
   */
  private validateCarInput(input: CreateCarInput): void {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError("Car name is required", "name");
    }

    if (!input.brand || input.brand.trim().length === 0) {
      throw new ValidationError("Car brand is required", "brand");
    }

    if (input.name.trim().length < 3) {
      throw new ValidationError(
        "Car name must be at least 3 characters long",
        "name"
      );
    }

    if (input.brand.trim().length < 3) {
      throw new ValidationError(
        "Car brand must be at least 3 characters long",
        "brand"
      );
    }

    if (typeof input.price !== "number" || input.price < 0) {
      throw new ValidationError("Price must be a positive number", "price");
    }

    if (input.price < 1000) {
      throw new ValidationError("Price must be at least 1000", "price");
    }

    if (typeof input.quantity !== "number" || input.quantity < 0) {
      throw new ValidationError(
        "Quantity must be a positive number",
        "quantity"
      );
    }

    if (input.quantity < 1) {
      throw new ValidationError("Quantity must be at least 1", "quantity");
    }
  }

  /**
   * Validate car update input
   */
  private validateCarUpdateInput(input: UpdateCarInput): void {
    if (input.name !== undefined) {
      if (input.name.trim().length < 3) {
        throw new ValidationError(
          "Car name must be at least 3 characters long",
          "name"
        );
      }
    }

    if (input.brand !== undefined) {
      if (input.brand.trim().length < 3) {
        throw new ValidationError(
          "Car brand must be at least 3 characters long",
          "brand"
        );
      }
    }

    if (input.price !== undefined) {
      if (typeof input.price !== "number" || input.price < 0) {
        throw new ValidationError("Price must be a positive number", "price");
      }

      if (input.price < 1000) {
        throw new ValidationError("Price must be at least 1000", "price");
      }
    }

    if (input.quantity !== undefined) {
      if (typeof input.quantity !== "number" || input.quantity < 0) {
        throw new ValidationError(
          "Quantity must be a positive number",
          "quantity"
        );
      }

      if (input.quantity < 1) {
        throw new ValidationError("Quantity must be at least 1", "quantity");
      }
    }
  }
}

export const carService = new CarService();
