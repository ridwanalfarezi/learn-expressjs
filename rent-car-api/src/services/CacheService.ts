import { safeRedisDel, safeRedisGet, safeRedisSet } from "../config/redis";

/**
 * Cache Service - Centralizes all caching logic
 * Provides consistent cache key generation and management
 */
export class CacheService {
  private readonly defaultTTL = 3600; // 1 hour

  /**
   * Generate cache key for users list
   */
  generateUsersKey(query?: string, page: number = 1): string {
    return `users:${query || ""}:${page}`;
  }

  /**
   * Generate cache key for single user
   */
  generateUserKey(userId: string): string {
    return `user:${userId}`;
  }

  /**
   * Generate cache key for cars list
   */
  generateCarsKey(query?: string, page: number = 1): string {
    return `cars:${query || ""}:${page}`;
  }

  /**
   * Generate cache key for single car
   */
  generateCarKey(carId: string): string {
    return `car:${carId}`;
  }

  /**
   * Generate cache key for rentals list
   */
  generateRentalsKey(
    query?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1
  ): string {
    return `rentals:${query || ""}:${page}:${startDate || ""}:${endDate || ""}`;
  }

  /**
   * Generate cache key for single rental
   */
  generateRentalKey(rentalId: string): string {
    return `rental:${rentalId}`;
  }

  /**
   * Generate cache key for user rentals
   */
  generateUserRentalsKey(userId: string): string {
    return `rentals:user:${userId}`;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await safeRedisGet(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    try {
      await safeRedisSet(key, JSON.stringify(value), {
        EX: ttl,
      });
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
    }
  }

  /**
   * Delete cache by pattern
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      await safeRedisDel(pattern);
    } catch (error) {
      console.error(`Cache DELETE error for pattern ${pattern}:`, error);
    }
  }

  /**
   * Invalidate all user-related caches
   */
  async invalidateUserCaches(userId?: string): Promise<void> {
    if (userId) {
      await this.invalidate(`user:${userId}`);
    }
    await this.invalidate(`users:*`);
  }

  /**
   * Invalidate all car-related caches
   */
  async invalidateCarCaches(carId?: string): Promise<void> {
    if (carId) {
      await this.invalidate(`car:${carId}`);
    }
    await this.invalidate(`cars:*`);
  }

  /**
   * Invalidate all rental-related caches
   */
  async invalidateRentalCaches(
    rentalId?: string,
    userId?: string
  ): Promise<void> {
    if (rentalId) {
      await this.invalidate(`rental:${rentalId}`);
    }
    if (userId) {
      await this.invalidate(`rentals:user:${userId}`);
    }
    await this.invalidate(`rentals:*`);
  }

  /**
   * Clear all application caches
   */
  async clearAll(): Promise<void> {
    try {
      await this.invalidate("*");
    } catch (error) {
      console.error("Cache FLUSH error:", error);
    }
  }
}

export const cacheService = new CacheService();
