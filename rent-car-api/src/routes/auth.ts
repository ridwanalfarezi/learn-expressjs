import { PrismaClient, User } from "@prisma/client";
import dotenv from "dotenv";
import { Request, Response, Router } from "express";
import passport from "passport";
import generateTokens from "../utils/generateTokens";
import verifyRefreshToken from "../utils/verifyRefreshToken";

const router = Router();
const prisma = new PrismaClient();
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
        refreshToken: tokens.refreshToken,
      },
    });
  }
);

router.post("/refresh", async (req: Request, res: Response): Promise<any> => {
  const { refreshToken } = req.body as { refreshToken: string };

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

    res.json({
      tokens: {
        type: "Bearer",
        accessToken: newAccessToken,
        refreshToken: newToken,
      },
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

router.post("/logout", async (req: Request, res: Response): Promise<any> => {
  const { refreshToken } = req.body as { refreshToken: string };

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

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

export default router;
