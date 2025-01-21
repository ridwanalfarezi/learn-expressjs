import jwt from "jsonwebtoken";
import AUTH_MESSAGES from "../messages/auth.js";

const authMiddleware = async (req, res, next) => {
  if (!req.headers.authorization)
    res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });

  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
    req.user = user;
    next();
  });
};

export default authMiddleware;
