import express from "express";
import {
  createComment,
  deleteComment,
  updateComment,
} from "../controller/comments.js";
import commentMiddleware from "../middleware/commentMiddleware.js";
const router = express.Router();

router.post("/comments", commentMiddleware, async (req, res) => {
  const { userId, text } = req.body;

  if (!userId || !text) {
    return res.status(400).json({ error: "Missing userId or text" });
  }
  res.json(await createComment(userId, text));
});

router.put("/comments/:commentId", commentMiddleware, async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    return res.status(400).json({ error: "Missing commentId" });
  }
  const { text } = req.body;
  if (!text) {
    return res.status(400).json("Missing text");
  }
  res.json(await updateComment(commentId, text));
});

router.delete("/comments/:commentId", commentMiddleware, async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    return res.status(400).json({ error: "Missing commentId" });
  }

  res.json(await deleteComment(commentId));
});

export { router as commentRouter };
