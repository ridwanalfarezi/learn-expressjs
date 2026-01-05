import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import ErrorHandler from "../utils/ErrorHandler";
import { carSchema, rentalSchema, userSchema } from "./schema";

const validateSchema =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      return next(new ErrorHandler(msg, 400));
    } else {
      next();
    }
  };

export const validateUser = validateSchema(userSchema);
export const validateCar = validateSchema(carSchema);
export const validateRentalStore = validateSchema(rentalSchema);
// For updates, prevent changing carId and quantity; price is not part of rentalSchema
export const validateRentalUpdate = validateSchema(
  rentalSchema.fork(["carId", "quantity"], (schema) => schema.forbidden())
);
