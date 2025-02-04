import { Router } from "express";
import upload from "../../config/multer";
import carsController from "../../controllers/carsController";
import { isAdmin } from "../../middlewares/authMiddleware";
import wrapAsync from "../../utils/wrapAsync";
import { validateCar } from "../../validators/validator";

const router = Router();

router
  .route("/")
  .get(isAdmin, wrapAsync(carsController.index))
  .post(
    isAdmin,
    upload.single("image"),
    validateCar,
    wrapAsync(carsController.store)
  );

router
  .route("/:id")
  .get(isAdmin, wrapAsync(carsController.show))
  .put(
    isAdmin,
    upload.single("image"),
    validateCar,
    wrapAsync(carsController.update)
  )
  .delete(isAdmin, wrapAsync(carsController.destroy));

export default router;
