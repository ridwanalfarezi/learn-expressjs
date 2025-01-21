import express from "express";
import { login, register } from "../controller/auth.js";
import AUTH_MESSAGES from "../messages/auth.js";
const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: AUTH_MESSAGES.MISS_USERNAME_PASSWORD });
  }
  res.json(await login(username, password));
});

router.post("/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (!username || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ error: AUTH_MESSAGES.MISS_USERNAME_PASSWORD_CONFIRM });
  }
  res.json(await register(username, password, confirmPassword));
});

export { router as authRouter };
