import { Request, Response } from "express";
import { userService } from "../services";
import { asyncHandler } from "../utils/errors";

/**
 * Users Controller - Thin controller focused only on HTTP concerns
 * All business logic delegated to UserService
 */
class UsersController {
  /**
   * GET /admin/users
   * Get list of users with optional filtering and pagination
   */
  index = asyncHandler(async (req: Request, res: Response) => {
    const { query, page } = req.query;

    const users = await userService.getAllUsers({
      query: (query as string) || "",
      page: Math.max(1, Math.min(parseInt(page as string) || 1, 1000)),
    });

    res.json({ data: users });
  });

  /**
   * GET /admin/users/:id
   * Get a single user by ID
   */
  show = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.json({ data: user });
  });

  /**
   * POST /admin/users
   * Create a new user
   */
  store = asyncHandler(async (req: Request, res: Response) => {
    const { name, email } = req.body;
    const user = await userService.createUser({ name, email });
    res.status(201).json({ message: "User created successfully", data: user });
  });

  /**
   * PUT /admin/users/:id
   * Update a user
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const user = await userService.updateUser(id, { name, email });
    res.json({ message: "User updated successfully", data: user });
  });

  /**
   * DELETE /admin/users/:id
   * Delete a user
   */
  destroy = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.json({ message: "User deleted successfully" });
  });
}

export default new UsersController();
