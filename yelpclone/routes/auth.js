import express from "express";
import passport from "passport";
import AuthController from "../controllers/auth.js";
import registerSchema from "../schemas/auth.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import wrapAsync from "../utils/wrapAsync.js";

const router = express.Router();

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    return next(new ErrorHandler(msg, 400));
  } else {
    next();
  }
};

router
  .route("/register")
  .get(AuthController.registerForm)
  .post(validateRegister, wrapAsync(AuthController.register));

router
  .route("/login")
  .get(AuthController.loginForm)
  .post(
    passport.authenticate("local", {
      successRedirect: "/places",
      failureRedirect: "/login",
      failureFlash: {
        type: "error",
        msg: "Invalid username or password.",
      },
    }),
    AuthController.login
  );

router.get("/logout", AuthController.logout);

export { router as authRouter };
