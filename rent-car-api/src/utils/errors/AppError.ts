/**
 * Base application error class
 * All application errors should extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error - thrown when input validation fails
 * HTTP 400
 */
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    field?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 400);
    Object.setPrototypeOf(this, ValidationError.prototype);
    this.field = field;
    this.details = details;
  }
}

/**
 * Authentication error - thrown when auth fails (invalid token, etc.)
 * HTTP 401
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error - thrown when user lacks permissions
 * HTTP 403
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = "You do not have permission to access this resource"
  ) {
    super(message, 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not found error - thrown when resource doesn't exist
 * HTTP 404
 */
export class NotFoundError extends AppError {
  public readonly resourceType?: string;
  public readonly resourceId?: string | number;

  constructor(
    message: string,
    resourceType?: string,
    resourceId?: string | number
  ) {
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Conflict error - thrown when operation conflicts with existing data
 * HTTP 409
 */
export class ConflictError extends AppError {
  public readonly conflictingField?: string;

  constructor(message: string, conflictingField?: string) {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
    this.conflictingField = conflictingField;
  }
}

/**
 * Business logic error - thrown when business rules are violated
 * HTTP 400
 */
export class BusinessLogicError extends AppError {
  constructor(message: string) {
    super(message, 400);
    Object.setPrototypeOf(this, BusinessLogicError.prototype);
  }
}

/**
 * Database error - thrown when database operation fails
 * HTTP 500
 */
export class DatabaseError extends AppError {
  public readonly originalError?: unknown;

  constructor(
    message: string = "Database operation failed",
    originalError?: unknown
  ) {
    super(message, 500);
    Object.setPrototypeOf(this, DatabaseError.prototype);
    this.originalError = originalError;
  }
}

/**
 * Server error - thrown for unexpected server errors
 * HTTP 500
 */
export class ServerError extends AppError {
  public readonly originalError?: unknown;

  constructor(
    message: string = "Internal server error",
    originalError?: unknown
  ) {
    super(message, 500);
    Object.setPrototypeOf(this, ServerError.prototype);
    this.originalError = originalError;
  }
}
