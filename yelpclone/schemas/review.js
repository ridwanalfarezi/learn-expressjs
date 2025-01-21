import Joi from "joi";

const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().min(3).required(),
  }).required(),
});

export default reviewSchema;
