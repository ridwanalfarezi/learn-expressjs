/**
 * Error codes and messages for consistent error handling across the application
 */

export const ErrorCodes = {
  // Validation errors (400)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_JSON: "INVALID_JSON",

  // Authentication errors (401)
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  INVALID_TOKEN: "INVALID_TOKEN",
  EXPIRED_TOKEN: "EXPIRED_TOKEN",

  // Authorization errors (403)
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  FORBIDDEN: "FORBIDDEN",

  // Not found errors (404)
  NOT_FOUND: "NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  CAR_NOT_FOUND: "CAR_NOT_FOUND",
  RENTAL_NOT_FOUND: "RENTAL_NOT_FOUND",

  // Conflict errors (409)
  CONFLICT: "CONFLICT",
  DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  INVALID_REFERENCE: "INVALID_REFERENCE",

  // Business logic errors (400)
  BUSINESS_LOGIC_ERROR: "BUSINESS_LOGIC_ERROR",
  INSUFFICIENT_CAR_QUANTITY: "INSUFFICIENT_CAR_QUANTITY",
  RENTAL_ALREADY_STARTED: "RENTAL_ALREADY_STARTED",
  CANNOT_MODIFY_COMPLETED_RENTAL: "CANNOT_MODIFY_COMPLETED_RENTAL",
  INVALID_DATE_RANGE: "INVALID_DATE_RANGE",
  RENTAL_NOT_CANCELLABLE: "RENTAL_NOT_CANCELLABLE",

  // Database errors (500)
  DATABASE_ERROR: "DATABASE_ERROR",

  // Server errors (500)
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export const ErrorMessages = {
  [ErrorCodes.VALIDATION_ERROR]: "Validation failed",
  [ErrorCodes.INVALID_JSON]: "Invalid JSON in request body",

  [ErrorCodes.AUTHENTICATION_ERROR]: "Authentication failed",
  [ErrorCodes.INVALID_TOKEN]: "Invalid or malformed token",
  [ErrorCodes.EXPIRED_TOKEN]: "Token has expired",

  [ErrorCodes.AUTHORIZATION_ERROR]:
    "You do not have permission to access this resource",
  [ErrorCodes.FORBIDDEN]: "Access forbidden",

  [ErrorCodes.NOT_FOUND]: "Resource not found",
  [ErrorCodes.USER_NOT_FOUND]: "User not found",
  [ErrorCodes.CAR_NOT_FOUND]: "Car not found",
  [ErrorCodes.RENTAL_NOT_FOUND]: "Rental not found",

  [ErrorCodes.CONFLICT]: "Resource conflict",
  [ErrorCodes.DUPLICATE_EMAIL]: "Email already exists",
  [ErrorCodes.DUPLICATE_ENTRY]: "Duplicate entry",
  [ErrorCodes.INVALID_REFERENCE]: "Invalid reference to another record",

  [ErrorCodes.BUSINESS_LOGIC_ERROR]: "Business logic error",
  [ErrorCodes.INSUFFICIENT_CAR_QUANTITY]: "Insufficient car quantity available",
  [ErrorCodes.RENTAL_ALREADY_STARTED]: "Rental has already started",
  [ErrorCodes.CANNOT_MODIFY_COMPLETED_RENTAL]:
    "Cannot modify a completed rental",
  [ErrorCodes.INVALID_DATE_RANGE]: "Invalid date range",
  [ErrorCodes.RENTAL_NOT_CANCELLABLE]: "This rental cannot be cancelled",

  [ErrorCodes.DATABASE_ERROR]: "Database operation failed",

  [ErrorCodes.INTERNAL_SERVER_ERROR]: "Internal server error",
  [ErrorCodes.SERVER_ERROR]: "Server error occurred",
  [ErrorCodes.UNKNOWN_ERROR]: "An unexpected error occurred",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
