import { Router } from "express";
import rentalsController from "../controllers/rentalsController";
import { isAdmin, isCustomer } from "../middlewares/authMiddleware";
import wrapAsync from "../utils/wrapAsync";
import {
  validateRentalStore,
  validateRentalUpdate,
} from "../validators/validator";

const router = Router();

router
  .route("/")
  .get(isAdmin, wrapAsync(rentalsController.index))
  .post(isCustomer, validateRentalStore, wrapAsync(rentalsController.store));

router
  .route("/:rentalId")
  .get(wrapAsync(rentalsController.show))
  .put(isCustomer, validateRentalUpdate, wrapAsync(rentalsController.update))
  .delete(isCustomer, wrapAsync(rentalsController.destroy));

router.get("/user/:userId", isCustomer, wrapAsync(rentalsController.showByUser));

export default router;
