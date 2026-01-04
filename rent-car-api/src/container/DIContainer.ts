/**
 * Simple Dependency Injection Container
 * Manages service instantiation and provides singleton instances
 * Alternative to heavy frameworks like inversify or tsyringe
 */

import { CarRepository, carRepository } from "../repositories/CarRepository";
import {
  RentalRepository,
  rentalRepository,
} from "../repositories/RentalRepository";
import {
  TokenRepository,
  tokenRepository,
} from "../repositories/TokenRepository";
import { UserRepository, userRepository } from "../repositories/UserRepository";
import { CacheService, cacheService } from "../services/CacheService";
import { CarService, carService } from "../services/CarService";
import { RentalService, rentalService } from "../services/RentalService";
import { UserService, userService } from "../services/UserService";

/**
 * Container interface defining all available services
 */
export interface Container {
  // Repositories
  userRepository: UserRepository;
  carRepository: CarRepository;
  rentalRepository: RentalRepository;
  tokenRepository: TokenRepository;

  // Services
  cacheService: CacheService;
  userService: UserService;
  carService: CarService;
  rentalService: RentalService;
}

/**
 * Create and return the DI container with all services
 * All services are singleton instances
 */
export function createContainer(): Container {
  return {
    // Repositories
    userRepository,
    carRepository,
    rentalRepository,
    tokenRepository,

    // Services
    cacheService,
    userService,
    carService,
    rentalService,
  };
}

// Create a global container instance
export const container = createContainer();

// Export individual services for direct imports if needed
export {
  cacheService,
  carRepository,
  carService,
  rentalRepository,
  rentalService,
  tokenRepository,
  userRepository,
  userService,
};
