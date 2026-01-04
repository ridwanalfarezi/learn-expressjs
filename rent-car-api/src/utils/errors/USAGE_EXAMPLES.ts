/**
 * Error Handling Documentation & Usage Examples
 *
 * This file demonstrates how to use the new error handling system
 */

import { Request, Response } from "express";
import {
  asyncHandler,
  AuthenticationError,
  AuthorizationError,
  BusinessLogicError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "./index";

// ============================================================================
// EXAMPLE 1: Throwing validation errors in a controller
// ============================================================================

export const exampleValidationError = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, name } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError("Invalid email format", "email", {
        received: email,
        expected: "valid email address",
      });
    }

    if (!name || name.length < 3) {
      throw new ValidationError(
        "Name must be at least 3 characters long",
        "name"
      );
    }

    res.json({ message: "Validation passed" });
  }
);

// ============================================================================
// EXAMPLE 2: Throwing authentication errors
// ============================================================================

export const exampleAuthenticationError = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AuthenticationError("No token provided");
    }

    // Simulate token validation
    if (!isValidToken(token)) {
      throw new AuthenticationError("Invalid or expired token");
    }

    res.json({ message: "Authentication successful" });
  }
);

// ============================================================================
// EXAMPLE 3: Throwing authorization errors
// ============================================================================

export const exampleAuthorizationError = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    if (user.role !== "admin") {
      throw new AuthorizationError(
        "Only administrators can access this resource"
      );
    }

    res.json({ message: "Authorization successful" });
  }
);

// ============================================================================
// EXAMPLE 4: Throwing not found errors
// ============================================================================

export const exampleNotFoundError = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.id;

    const user = await findUserById(userId); // Returns null if not found

    if (!user) {
      throw new NotFoundError(
        `User with ID ${userId} not found`,
        "User",
        userId
      );
    }

    res.json(user);
  }
);

// ============================================================================
// EXAMPLE 5: Throwing conflict errors (duplicate entries)
// ============================================================================

export const exampleConflictError = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      throw new ConflictError("A user with this email already exists", "email");
    }

    res.json({ message: "User created successfully" });
  }
);

// ============================================================================
// EXAMPLE 6: Throwing business logic errors
// ============================================================================

export const exampleBusinessLogicError = asyncHandler(
  async (req: Request, res: Response) => {
    const { carId, quantity } = req.body;

    const car = await findCarById(carId);

    if (!car) {
      throw new NotFoundError(`Car not found`, "Car", carId);
    }

    if (car.quantity < quantity) {
      throw new BusinessLogicError(
        `Insufficient car quantity. Available: ${car.quantity}, Requested: ${quantity}`
      );
    }

    res.json({ message: "Rental created successfully" });
  }
);

// ============================================================================
// EXAMPLE 7: Using asyncHandler in routes
// ============================================================================

export const setupRouteWithAsyncHandler = () => {
  const express = require("express");
  const router = express.Router();

  // All these handlers are automatically wrapped to catch errors
  router.post("/users", exampleValidationError);
  router.get("/users/:id", exampleNotFoundError);
  router.post("/cars/rental", exampleBusinessLogicError);

  return router;
};

// ============================================================================
// EXAMPLE 8: Handling Prisma errors automatically
// ============================================================================

/**
 * The global error handler automatically converts Prisma errors:
 *
 * P2025 (Record not found) → 404 NotFoundError
 * P2002 (Unique constraint) → 409 ConflictError
 * P2003 (Foreign key) → 400 InvalidReference
 * Other → 500 DatabaseError
 *
 * Example:
 */

export const handlePrismaErrorsAutomatically = asyncHandler(
  async (req: Request, res: Response) => {
    // If user not found, Prisma throws P2025
    // Global handler converts to 404 NotFoundError automatically
    // const user = await prisma.user.findUniqueOrThrow({ where: { id: "123" } });

    // If email already exists, Prisma throws P2002
    // Global handler converts to 409 ConflictError automatically
    // const user = await prisma.user.create({ data: { email, name } });

    res.json({ message: "Operation successful" });
  }
);

// ============================================================================
// EXAMPLE 9: Custom error handling in specific cases
// ============================================================================

export const customErrorHandling = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      // Your database or API call
      const result = await someOperation();
      res.json(result);
    } catch (error: any) {
      // Convert specific errors to domain errors
      if (error.code === "ECONNREFUSED") {
        throw new BusinessLogicError("Service temporarily unavailable");
      }

      // Re-throw as-is for global handler to process
      throw error;
    }
  }
);

// ============================================================================
// Helper functions (mock implementations)
// ============================================================================

function isValidToken(token: string): boolean {
  return token.length > 0;
}

async function findUserById(id: string): Promise<any> {
  return null;
}

async function findUserByEmail(email: string): Promise<any> {
  return null;
}

async function findCarById(id: string): Promise<any> {
  return null;
}

async function someOperation(): Promise<any> {
  return { success: true };
}
