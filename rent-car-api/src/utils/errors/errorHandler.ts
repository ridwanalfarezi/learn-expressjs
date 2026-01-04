import { NextFunction, Request, Response } from "express";
import { logError } from "../logger";
import { AppError, ValidationError } from "./AppError";

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    field?: string;
    details?: Record<string, unknown>;
    resourceType?: string;
    timestamp: string;
  };
}

/**
 * Global error handler middleware
 * Should be registered as the last middleware in the Express app
 */
export const globalErrorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logError(error, {
    url: req.originalUrl,
    method: req.method,
    userId: (req as any).user?.id,
  });

  // If response already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = 500;
  let message = "Internal server error";
  let errorCode = "INTERNAL_SERVER_ERROR";
  let field: string | undefined;
  let details: Record<string, unknown> | undefined;
  let resourceType: string | undefined;

  // Handle known AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;

    if (error instanceof ValidationError) {
      errorCode = "VALIDATION_ERROR";
      field = error.field;
      details = error.details;
    } else if (error.constructor.name === "AuthenticationError") {
      errorCode = "AUTHENTICATION_ERROR";
    } else if (error.constructor.name === "AuthorizationError") {
      errorCode = "AUTHORIZATION_ERROR";
    } else if (error.constructor.name === "NotFoundError") {
      errorCode = "NOT_FOUND";
      resourceType = (error as any).resourceType;
    } else if (error.constructor.name === "ConflictError") {
      errorCode = "CONFLICT";
    } else if (error.constructor.name === "BusinessLogicError") {
      errorCode = "BUSINESS_LOGIC_ERROR";
    } else if (error.constructor.name === "DatabaseError") {
      errorCode = "DATABASE_ERROR";
    } else if (error.constructor.name === "ServerError") {
      errorCode = "SERVER_ERROR";
    }
  }
  // Handle Prisma errors
  else if ((error as any).code) {
    const prismaCode = (error as any).code;

    if (prismaCode === "P2025") {
      // Record not found
      statusCode = 404;
      errorCode = "NOT_FOUND";
      message = "Resource not found";
    } else if (prismaCode === "P2002") {
      // Unique constraint violation
      statusCode = 409;
      errorCode = "CONFLICT";
      message = `Duplicate entry for field: ${
        (error as any).meta?.target?.[0] || "unknown"
      }`;
    } else if (prismaCode === "P2003") {
      // Foreign key constraint violation
      statusCode = 400;
      errorCode = "INVALID_REFERENCE";
      message = "Invalid reference to another record";
    } else {
      statusCode = 500;
      errorCode = "DATABASE_ERROR";
      message = "Database operation failed";
    }
  }
  // Handle JSON parse errors
  else if (error instanceof SyntaxError && "body" in error) {
    statusCode = 400;
    errorCode = "INVALID_JSON";
    message = "Invalid JSON in request body";
  }
  // Handle unknown errors
  else {
    statusCode = 500;
    errorCode = "UNKNOWN_ERROR";
    message = error.message || "An unexpected error occurred";
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      message,
      code: errorCode,
      statusCode,
      field,
      details,
      resourceType,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(statusCode).json(response);
};

/**
 * Wrapper for async route handlers to catch errors
 * Usage: router.get('/path', asyncHandler(async (req, res) => {...}))
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
