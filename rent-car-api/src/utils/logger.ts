import path from "path";
import winston from "winston";

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../../logs");

// Create logger instance
export const securityLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "rent-car-api" },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Security events
    new winston.transports.File({
      filename: path.join(logsDir, "security.log"),
      level: "warn",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // All logs
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Console logging in development
if (process.env.NODE_ENV !== "production") {
  securityLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Helper function to log security events
export const logSecurityEvent = (event: string, details: any) => {
  securityLogger.warn(event, {
    timestamp: new Date().toISOString(),
    event,
    ...details,
  });
};

// Helper function to log errors
export const logError = (error: Error, context?: any) => {
  securityLogger.error("Application Error", {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

export default securityLogger;
