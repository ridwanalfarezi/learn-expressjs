import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import passport from "passport";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { initializePassport } from "./config/passport";
import swaggerSpec from "./config/swagger";
import { PORT, SERVER_URL } from "./env";
import carsRouter from "./routes/admin/cars";
import usersRouter from "./routes/admin/users";
import authRouter from "./routes/auth";
import rentalsRouter from "./routes/rentals";
import "./utils/cronJobs";
import ErrorHandler from "./utils/ErrorHandler";
import { globalErrorHandler } from "./utils/errors/errorHandler";

const app = express();

// Security Middleware - Helmet untuk mengamankan HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    referrerPolicy: { policy: "same-origin" },
  })
);

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // Cache preflight for 24 hours
  })
);

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // 100 requests per window
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Hanya 5 attempts per 15 menit
  message: "Too many authentication attempts, please try again later",
  skipSuccessfulRequests: true, // Hanya count failed attempts
});

// Middleware
app.use(express.json({ limit: "10kb" })); // Limit JSON payload
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // Limit URL-encoded
app.use(cookieParser()); // Untuk membaca cookies
app.use(
  "/public/images",
  express.static(path.join(__dirname, "../public/images"))
);

// Initialize Passport
initializePassport(passport);
app.use(passport.initialize());

app.use("/auth", authLimiter, authRouter);
app.use("/rentals", apiLimiter, rentalsRouter);

// Admin routes
app.use("/admin/users", apiLimiter, usersRouter);
app.use("/admin/cars", apiLimiter, carsRouter);

// API documentation
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);
app.get("/docs.json", (_req: Request, res: Response) => {
  res.json(swaggerSpec);
});

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Car Rental API, API Docs: /docs" });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new ErrorHandler("Route not found", 404));
});

// Global error handler - must be registered last
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server running on ${SERVER_URL}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
});
