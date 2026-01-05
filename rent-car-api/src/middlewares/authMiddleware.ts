import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../env";
import prisma from "../utils/prismaClient";
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
  role: "customer" | "admin"
): Promise<any> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as jwt.JwtPayload;

    if (decoded.role !== role) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { token: true },
    });

    if (!currentUser) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!currentUser.token) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (currentUser.token?.id !== decoded.tokenId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired access token" });
  }
};

export const isCustomer = (req: Request, res: Response, next: NextFunction) =>
  verifyUser(req, res, next, "customer");

export const isAdmin = (req: Request, res: Response, next: NextFunction) =>
  verifyUser(req, res, next, "admin");
