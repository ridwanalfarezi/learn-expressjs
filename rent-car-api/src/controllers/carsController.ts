import { Request, Response } from "express";
import { carService } from "../services";
import { asyncHandler } from "../utils/errors";

/**
 * Cars Controller - Thin controller focused only on HTTP concerns
 * All business logic delegated to CarService
 */
class CarsController {
  /**
   * GET /admin/cars
   * Get list of cars with optional filtering and pagination
   */
  index = asyncHandler(async (req: Request, res: Response) => {
    const { query, page } = req.query;

    const cars = await carService.getAllCars({
      query: (query as string) || "",
      page: Math.max(1, Math.min(parseInt(page as string) || 1, 1000)),
    });

    res.json({ data: cars });
  });

  /**
   * GET /admin/cars/:id
   * Get a single car by ID
   */
  show = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const car = await carService.getCarById(id);
    res.json({ data: car });
  });

  /**
   * POST /admin/cars
   * Create a new car
   */
  store = asyncHandler(async (req: Request, res: Response) => {
    const { name, brand, price, quantity } = req.body;

    const car = await carService.createCar({
      name,
      brand,
      price: Number(price),
      quantity: Number(quantity),
      image: req.file ? req.file.path : undefined,
    });

    res.status(201).json({ message: "Car created successfully", data: car });
  });

  /**
   * PUT /admin/cars/:id
   * Update a car
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, brand, price, quantity } = req.body;

    const car = await carService.updateCar(id, {
      name,
      brand,
      price: price ? Number(price) : undefined,
      quantity: quantity ? Number(quantity) : undefined,
      image: req.file ? req.file.path : undefined,
    });

    res.json({ message: "Car updated successfully", data: car });
  });

  /**
   * DELETE /admin/cars/:id
   * Delete a car
   */
  destroy = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await carService.deleteCar(id);
    res.json({ message: "Car deleted successfully" });
  });
}

export default new CarsController();
