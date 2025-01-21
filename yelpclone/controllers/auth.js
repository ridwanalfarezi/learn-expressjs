import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import passport from "passport";

const prisma = new PrismaClient();

const AuthController = {
  registerForm: (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/places");

    res.render("auth/register");
  },
  loginForm: (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/places");

    res.render("auth/login");
  },
  register: async (req, res) => {
    const { email, name, username, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          username,
          password: hashedPassword,
        },
      });

      req.login(newUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome! You are now logged in.");
        return res.redirect("/places");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/register");
    }
  },
  login: (req, res) => {
    req.flash("success", "You have logged in.");
    res.redirect("/places");
  },
  logout: (req, res) => {
    req.logout((err) => {
      if (err) return next(err);

      req.flash("success", "You have logged out.");
      res.redirect("/login");
    });
  },
};

export default AuthController;
