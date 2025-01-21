import Joi from "joi";

const placeSchema = Joi.object({
  place: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    price: Joi.number().min(0).required(),
  }).required(),
});

export default placeSchema;
