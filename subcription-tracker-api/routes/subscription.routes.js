import { Router } from "express";
import {
  cancelSubscription,
  createSubscription,
  deleteSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  getUpcomingRenewals,
  getUserSubscriptions,
  updateSubscription,
} from "../controllers/subscription.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const subcriptionRouter = Router();

subcriptionRouter.get("/upcoming-renewals", authorize, getUpcomingRenewals);

subcriptionRouter
  .route("/")
  .get(getAllSubscriptions)
  .post(authorize, createSubscription);

subcriptionRouter
  .route("/:id")
  .get(getSubscriptionById)
  .put(authorize, updateSubscription)
  .delete(authorize, deleteSubscription);

subcriptionRouter.put("/:id/cancel", authorize, cancelSubscription);

subcriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

export default subcriptionRouter;
