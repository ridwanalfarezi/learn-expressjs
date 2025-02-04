import Joi from "joi";

export const userSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
});

export const carSchema = Joi.object({
  name: Joi.string().min(3).required(),
  brand: Joi.string().min(3).required(),
  price: Joi.number().min(1000).required(),
  quantity: Joi.number().min(1).required(),
});

export const rentalSchema = Joi.object({
  carId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  price: Joi.number().required(),
  startDate: Joi.date().min("now").required(),
  endDate: Joi.date()
    .min(Joi.ref("startDate"))
    .messages({
      "date.min": "End date must be after start date",
    })
    .required(),
});
