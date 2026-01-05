import { User } from "@prisma/client";
import dotenv from "dotenv";
import { Request, Response, Router } from "express";
import passport from "passport";
import generateTokens from "../utils/generateTokens";
import prisma from "../utils/prismaClient";
import verifyRefreshToken from "../utils/verifyRefreshToken";

const router = Router();
dotenv.config();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  (req: Request, res: Response) => {
    const { user, tokens } = req.user as {
      user: User;
      tokens: { accessToken: string; refreshToken: string };
    };

    // Set HttpOnly Cookie untuk refresh token (Anti-XSS)
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true, // JS tidak bisa akses
      secure: process.env.NODE_ENV === "production", // Wajib HTTPS di production
      sameSite: "strict", // Anti-CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Hari
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token: {
        type: "Bearer",
        accessToken: tokens.accessToken,
        // refreshToken tidak lagi dikirim di body untuk keamanan
      },
    });
  }
);

router.post("/refresh", async (req: Request, res: Response): Promise<any> => {
  // Baca refresh token dari HttpOnly Cookie (Security Enhancement)
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const { error, tokenDetails } = await verifyRefreshToken(refreshToken);

    if (error || !tokenDetails) {
      return res
        .status(403)
        .json({ message: error || "Invalid refresh token" });
    }

    const userId = tokenDetails.id;
    const email = tokenDetails.email;
    const role = tokenDetails.role;
    const tokenId = tokenDetails.tokenId;

    const { accessToken: newAccessToken, refreshToken: newToken } =
      await generateTokens({ id: userId, email, role, tokenId }, true);

    // Update cookie dengan refresh token baru
    res.cookie("refreshToken", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      tokens: {
        type: "Bearer",
        accessToken: newAccessToken,
        // refreshToken tidak dikirim di body untuk keamanan
      },
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

router.post("/logout", async (req: Request, res: Response): Promise<any> => {
  // Baca refresh token dari HttpOnly Cookie
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const { error } = await verifyRefreshToken(refreshToken);

    if (error) {
      return res.status(403).json({ message: error });
    }

    await prisma.token.delete({
      where: { token: refreshToken },
    });

    // Clear cookie setelah logout
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

export default router;
