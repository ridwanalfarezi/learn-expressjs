import express from "express";
import {
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controller/users.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// Users

router.get("/users", async (req, res) => {
  res.json(await getUsers());
});

router.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }
  res.json(await getUserById(userId));
});

router.put("/users/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  res.json(await updateUser(userId, username));
});

router.delete("/users/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  res.json(await deleteUser(userId));
});

export { router as userRouter };
