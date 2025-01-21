import jwt from "jsonwebtoken";
import AUTH_MESSAGES from "../messages/auth.js";
import { prisma } from "../prisma/prisma.js";
import COMMENT_MESSAGES from "../messages/comments.js";

const commentMiddleware = async (req, res, next) => {
  const { userId, commentId } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
  }

  const token = authHeader.split(" ")[1];

  if (userId) {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (!user) {
      return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
    }

    if (Number(userId) !== user.id) {
      return res.status(403).json({ error: AUTH_MESSAGES.FORBIDDEN });
    }
  }

  if (commentId) {
    const comment = await prisma.comment.findUnique({
      where: {
        id: Number(commentId),
      },
    });

    if (!comment) {
      return res.status(404).json({ error: COMMENT_MESSAGES.NOT_FOUND });
    }

    if (comment.userId !== user.id) {
      return res.status(403).json({ error: AUTH_MESSAGES.FORBIDDEN });
    }
  }

  next();
};

export default commentMiddleware;
