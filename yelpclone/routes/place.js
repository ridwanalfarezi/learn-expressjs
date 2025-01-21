import express from "express";
import upload from "../config/multer.js";
import PlaceController from "../controllers/places.js";
import isAuth from "../middlewares/isAuth.js";
import { isAuthorPlace } from "../middlewares/isAuthor.js";
import { isValidId } from "../middlewares/isValidId.js";
import { validatePlace } from "../middlewares/validator.js";
import wrapAsync from "../utils/wrapAsync.js";

const router = express.Router();

router
  .route("/")
  .get(wrapAsync(PlaceController.index))
  .post(
    isAuth,
    upload.array("image", 5),
    validatePlace,
    wrapAsync(PlaceController.store)
  );

router.get("/new", isAuth, PlaceController.new);

router
  .route("/:id")
  .get(isValidId("/places"), wrapAsync(PlaceController.show))
  .put(
    isAuth,
    isAuthorPlace,
    isValidId("/places"),
    upload.array("image", 5),
    validatePlace,
    wrapAsync(PlaceController.update)
  )
  .delete(
    isAuth,
    isAuthorPlace,
    isValidId("/places"),
    wrapAsync(PlaceController.destroy)
  );

router.get(
  "/:id/edit",
  isAuth,
  isAuthorPlace,
  isValidId("/places"),
  wrapAsync(PlaceController.edit)
);

router.delete(
  "/:id/images",
  isAuth,
  isAuthorPlace,
  isValidId("/places"),
  wrapAsync(PlaceController.deleteImage)
);

export { router as placeRouter };
