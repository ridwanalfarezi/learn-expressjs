import { Router } from "express";
import usersController from "../../controllers/usersController";
import wrapAsync from "../../utils/wrapAsync";
import { validateUser } from "../../validators/validator";
import { isAdmin } from "./../../middlewares/authMiddleware";

const router = Router();

router
  .route("/")
  .get(isAdmin, wrapAsync(usersController.index))
  .post(isAdmin, validateUser, wrapAsync(usersController.store));

router
  .route("/:id")
  .get(isAdmin, wrapAsync(usersController.show))
  .put(isAdmin, validateUser, wrapAsync(usersController.update))
  .delete(isAdmin, wrapAsync(usersController.destroy));

export default router;
