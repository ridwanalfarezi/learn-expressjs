import express from "express";
import ReviewController from "../controllers/reviews.js";
import isAuth from "../middlewares/isAuth.js";
import { isAuthorReview } from "../middlewares/isAuthor.js";
import { isValidId } from "../middlewares/isValidId.js";
import { validateReview } from "../middlewares/validator.js";
import wrapAsync from "../utils/wrapAsync.js";

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  isAuth,
  isValidId("/places"),
  validateReview,
  wrapAsync(ReviewController.store)
);

router.delete(
  "/:reviewId",
  isAuth,
  isAuthorReview,
  isValidId("/places"),
  wrapAsync(ReviewController.destroy)
);

export { router as reviewRouter };
