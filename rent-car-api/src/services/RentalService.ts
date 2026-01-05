import { Rental } from "@prisma/client";
import { rentalRepository, UpdateRentalInput } from "../repositories";
import {
  AuthorizationError,
  BusinessLogicError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";
import { logSecurityEvent } from "../utils/logger";
import { cacheService } from "./CacheService";
import { carService } from "./CarService";
import { userService } from "./UserService";

export interface RentalServiceFilterOptions {
  query?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
}

export interface RentalCreateRequest {
  userId?: string;
  carId: string;
  quantity: number;
  startDate: string | Date;
  endDate: string | Date;
  currentUserId?: string;
  currentUserRole?: string;
}

export interface RentalUpdateRequest {
  startDate?: string | Date;
  endDate?: string | Date;
  currentUserId?: string;
  currentUserRole?: string;
}

/**
 * Rental Service - Contains complex business logic for rental operations
 * Handles price calculations, date validations, authorization checks
 */
export class RentalService {
  private readonly MIN_HOURS_BEFORE_START = 1; // 1 hour

  /**
   * Get all rentals with caching
   */
  async getAllRentals(
    options: RentalServiceFilterOptions = {}
  ): Promise<Rental[]> {
    const { query = "", startDate, endDate, page = 1 } = options;

    // Generate cache key
    const cacheKey = cacheService.generateRentalsKey(
      query,
      startDate?.toISOString(),
      endDate?.toISOString(),
      page
    );

    // Try to get from cache
    const cachedRentals = await cacheService.get<Rental[]>(cacheKey);
    if (cachedRentals) {
      return cachedRentals;
    }

    // Fetch from repository
    const rentals = await rentalRepository.findMany({
      query,
      startDate,
      endDate,
      page,
      take: 10,
    });

    // Store in cache
    await cacheService.set(cacheKey, rentals);

    return rentals;
  }

  /**
   * Get rental by ID with ownership validation
   */
  async getRentalById(
    rentalId: string,
    currentUserId?: string,
    currentUserRole?: string
  ): Promise<Rental> {
    if (!rentalId || rentalId.trim().length === 0) {
      throw new ValidationError("Rental ID is required", "rentalId");
    }

    // Try to get from cache
    const cacheKey = cacheService.generateRentalKey(rentalId);
    const cachedRental = await cacheService.get<Rental>(cacheKey);

    let rental = cachedRental;

    if (!rental) {
      // Fetch from repository
      rental = await rentalRepository.findById(rentalId);

      if (!rental) {
        throw new NotFoundError(`Rental not found`, "Rental", rentalId);
      }

      // Store in cache
      await cacheService.set(cacheKey, rental);
    }

    // Check authorization (unless admin)
    if (currentUserRole !== "admin" && currentUserId !== rental.userId) {
      logSecurityEvent("UNAUTHORIZED_RENTAL_ACCESS", {
        userId: currentUserId,
        targetRentalId: rentalId,
        rentalOwnerId: rental.userId,
      });
      throw new AuthorizationError("You don't have access to this rental");
    }

    return rental;
  }

  /**
   * Get rentals by user ID with ownership validation
   */
  async getRentalsByUserId(
    userId: string,
    currentUserId?: string,
    currentUserRole?: string
  ): Promise<Rental[]> {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError("User ID is required", "userId");
    }

    // Check authorization (unless admin)
    if (currentUserRole !== "admin" && currentUserId !== userId) {
      logSecurityEvent("UNAUTHORIZED_USER_RENTALS_ACCESS", {
        userId: currentUserId,
        targetUserId: userId,
      });
      throw new AuthorizationError(
        "You don't have access to this user's rentals"
      );
    }

    // Try to get from cache
    const cacheKey = cacheService.generateUserRentalsKey(userId);
    const cachedRentals = await cacheService.get<Rental[]>(cacheKey);

    if (cachedRentals) {
      return cachedRentals;
    }

    // Fetch from repository
    const rentals = await rentalRepository.findByUserId(userId);

    // Store in cache
    await cacheService.set(cacheKey, rentals);

    return rentals;
  }

  /**
   * Create a new rental
   */
  async createRental(request: RentalCreateRequest): Promise<Rental> {
    const { carId, quantity, startDate, endDate, currentUserId } = request;

    // Validate input
    this.validateRentalInput({ carId, quantity, startDate, endDate });

    // Use current user ID as rental owner
    const userId = currentUserId;
    if (!userId) {
      throw new ValidationError("User ID is required", "userId");
    }

    // Verify user exists
    await userService.getUserById(userId);

    // Verify car exists and has sufficient quantity
    const car = await carService.getCarById(carId);

    if (car.quantity < quantity) {
      throw new BusinessLogicError(
        `Insufficient car quantity. Available: ${car.quantity}, Requested: ${quantity}`
      );
    }

    // Parse dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Additional date validations
    const now = new Date();
    if (startDateObj < now) {
      throw new BusinessLogicError("Start date cannot be in the past");
    }

    // Calculate price server-side
    const days = this.calculateDays(startDateObj, endDateObj);
    if (days <= 0) {
      throw new BusinessLogicError("End date must be after start date");
    }

    const price = car.price * quantity * days;

    // Create rental
    const rental = await rentalRepository.create({
      userId,
      carId,
      startDate: startDateObj,
      endDate: endDateObj,
      quantity,
      price,
    });

    // Reserve car quantity
    await carService.reserveQuantity(carId, quantity);

    // Invalidate caches
    await cacheService.invalidateRentalCaches();

    return rental;
  }

  /**
   * Update a rental with strict validations
   */
  async updateRental(
    rentalId: string,
    request: RentalUpdateRequest
  ): Promise<Rental> {
    const { startDate, endDate, currentUserId, currentUserRole } = request;

    if (!rentalId || rentalId.trim().length === 0) {
      throw new ValidationError("Rental ID is required", "rentalId");
    }

    // Get rental with authorization check
    const rental = await this.getRentalById(
      rentalId,
      currentUserId,
      currentUserRole
    );

    const originalStartDate = new Date(rental.startDate);
    const originalEndDate = new Date(rental.endDate);
    if (
      isNaN(originalStartDate.getTime()) ||
      isNaN(originalEndDate.getTime())
    ) {
      throw new BusinessLogicError("Rental dates are invalid");
    }

    // Check if rental can be updated
    if (rental.status === "active") {
      throw new BusinessLogicError("Cannot update an active rental");
    }

    if (rental.status !== "pending") {
      throw new BusinessLogicError(`Cannot update a ${rental.status} rental`);
    }

    // Validate new dates if provided
    if (startDate || endDate) {
      const newStartDate = startDate ? new Date(startDate) : originalStartDate;
      const newEndDate = endDate ? new Date(endDate) : originalEndDate;

      this.validateRentalDates(newStartDate, newEndDate, originalStartDate);

      // Validate that duration hasn't changed
      const originalDays = this.calculateDays(
        originalStartDate,
        originalEndDate
      );
      const newDays = this.calculateDays(newStartDate, newEndDate);

      if (originalDays !== newDays) {
        throw new BusinessLogicError("Rental duration cannot be changed");
      }
    }

    // Update rental
    const updateData: UpdateRentalInput = {};
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    const updatedRental = await rentalRepository.update(rentalId, updateData);

    // Invalidate caches
    await cacheService.invalidateRentalCaches(rentalId, rental.userId);

    return updatedRental;
  }

  /**
   * Cancel a rental (soft delete)
   */
  async cancelRental(
    rentalId: string,
    currentUserId?: string,
    currentUserRole?: string
  ): Promise<Rental> {
    if (!rentalId || rentalId.trim().length === 0) {
      throw new ValidationError("Rental ID is required", "rentalId");
    }

    // Get rental with authorization check
    const rental = await this.getRentalById(
      rentalId,
      currentUserId,
      currentUserRole
    );

    // Only pending rentals can be cancelled
    if (rental.status !== "pending") {
      throw new BusinessLogicError("Only pending rentals can be cancelled");
    }

    // Delete rental from database
    const deletedRental = await rentalRepository.delete(rentalId);

    // Release car quantity back
    await carService.releaseQuantity(rental.carId, rental.quantity);

    // Invalidate caches
    await cacheService.invalidateRentalCaches(rentalId, rental.userId);

    return deletedRental;
  }

  /**
   * Validate rental input
   */
  private validateRentalInput(input: {
    carId: string;
    quantity: number;
    startDate: string | Date;
    endDate: string | Date;
  }): void {
    if (!input.carId || input.carId.trim().length === 0) {
      throw new ValidationError("Car ID is required", "carId");
    }

    if (!input.quantity || input.quantity <= 0) {
      throw new ValidationError("Quantity must be greater than 0", "quantity");
    }

    if (input.quantity > 100) {
      throw new ValidationError("Quantity cannot exceed 100", "quantity");
    }

    if (!input.startDate) {
      throw new ValidationError("Start date is required", "startDate");
    }

    if (!input.endDate) {
      throw new ValidationError("End date is required", "endDate");
    }

    const startDateObj = new Date(input.startDate);
    const endDateObj = new Date(input.endDate);

    if (isNaN(startDateObj.getTime())) {
      throw new ValidationError("Invalid start date format", "startDate");
    }

    if (isNaN(endDateObj.getTime())) {
      throw new ValidationError("Invalid end date format", "endDate");
    }

    if (endDateObj <= startDateObj) {
      throw new ValidationError("End date must be after start date", "endDate");
    }
  }

  /**
   * Validate rental dates for updates
   */
  private validateRentalDates(
    newStartDate: Date,
    newEndDate: Date,
    originalStartDate: Date
  ): void {
    const now = new Date();
    const oneHourBeforeStart = new Date(
      originalStartDate.getTime() - this.MIN_HOURS_BEFORE_START * 60 * 60 * 1000
    );

    // Can't update less than 1 hour before original start date
    if (newStartDate < oneHourBeforeStart) {
      throw new BusinessLogicError(
        `Cannot update rental less than ${this.MIN_HOURS_BEFORE_START} hour(s) before start date`
      );
    }

    if (newEndDate <= newStartDate) {
      throw new BusinessLogicError("End date must be after start date");
    }
  }

  /**
   * Calculate number of days between two dates
   */
  private calculateDays(startDate: Date, endDate: Date): number {
    const timeDifference = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  }
}

export const rentalService = new RentalService();
