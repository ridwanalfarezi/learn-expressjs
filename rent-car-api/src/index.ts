import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import path from "path";
import { initializePassport } from "./config/passport";
import { SERVER_URL } from "./env";
import carsRouter from "./routes/admin/cars";
import usersRouter from "./routes/admin/users";
import authRouter from "./routes/auth";
import rentalsRouter from "./routes/rentals";
import ErrorHandler from "./utils/ErrorHandler";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/public/images",
  express.static(path.join(__dirname, "../public/images"))
);

// Initialize Passport
initializePassport(passport);
app.use(passport.initialize());

app.use("/auth", authRouter);
app.use("/rentals", rentalsRouter);

// Admin routes
app.use("/admin/users", usersRouter);
app.use("/admin/cars", carsRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Car Rental API, API Docs: /docs" });
});

app.get("/docs", (req: Request, res: Response) => {
  res.redirect("https://documenter.getpostman.com/view/27798268/2sAYX5Khec");
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new ErrorHandler("Route not found", 404));
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).json({ message: err.message });
});

app.listen(3000, () => {
  console.log(`Server running on ${SERVER_URL}`);
});