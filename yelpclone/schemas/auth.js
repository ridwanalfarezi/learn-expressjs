import Joi from "joi";

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).optional(),
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password harus memiliki panjang minimal 8 karakter.",
    "any.required": "Password diperlukan.",
  }),
});

export default registerSchema;