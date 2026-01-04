import { Request, Response } from "express";
import { rentalService } from "../services";
import { asyncHandler } from "../utils/errors";

/**
 * Rentals Controller - Thin controller focused only on HTTP concerns
 * All business logic delegated to RentalService
 */
class RentalsController {
  /**
   * GET /rentals
   * Get list of rentals with optional filtering and pagination
   */
  index = asyncHandler(async (req: Request, res: Response) => {
    const { query, page, startDate, endDate } = req.query;

    const rentals = await rentalService.getAllRentals({
      query: (query as string) || "",
      page: Math.max(1, Math.min(parseInt(page as string) || 1, 1000)),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({ data: rentals });
  });

  /**
   * GET /rentals/:rentalId
   * Get a single rental by ID
   */
  show = asyncHandler(async (req: Request, res: Response) => {
    const { rentalId } = req.params;
    const currentUser = req.user as any;

    const rental = await rentalService.getRentalById(
      rentalId,
      currentUser.id,
      currentUser.role
    );

    res.json({ data: rental });
  });

  /**
   * POST /rentals
   * Create a new rental
   */
  store = asyncHandler(async (req: Request, res: Response) => {
    const { carId, quantity, startDate, endDate } = req.body;
    const currentUser = req.user as any;

    const rental = await rentalService.createRental({
      carId,
      quantity: Number(quantity),
      startDate,
      endDate,
      currentUserId: currentUser.id,
    });

    res
      .status(201)
      .json({ message: "Rental created successfully", data: rental });
  });

  /**
   * PUT /rentals/:rentalId
   * Update a rental
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const { rentalId } = req.params;
    const { startDate, endDate } = req.body;
    const currentUser = req.user as any;

    const rental = await rentalService.updateRental(rentalId, {
      startDate,
      endDate,
      currentUserId: currentUser.id,
      currentUserRole: currentUser.role,
    });

    res.json({ message: "Rental updated successfully", data: rental });
  });

  /**
   * DELETE /rentals/:rentalId
   * Cancel a rental
   */
  destroy = asyncHandler(async (req: Request, res: Response) => {
    const { rentalId } = req.params;
    const currentUser = req.user as any;

    await rentalService.cancelRental(
      rentalId,
      currentUser.id,
      currentUser.role
    );

    res.json({ message: "Rental cancelled successfully" });
  });

  /**
   * GET /rentals/user/:userId
   * Get rentals for a specific user
   */
  showByUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const currentUser = req.user as any;

    const rentals = await rentalService.getRentalsByUserId(
      userId,
      currentUser.id,
      currentUser.role
    );

    res.json({ data: rentals });
  });
}

export default new RentalsController();
