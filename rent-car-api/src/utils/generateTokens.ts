import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
} from "../env";
import ErrorHandler from "./ErrorHandler";

const prisma = new PrismaClient();

async function generateTokens(
  user: { id: string; email: string; role: string; tokenId?: string },
  updateDb = false
): Promise<{ accessToken: string; refreshToken: string }> {
  let refreshTokenId = user?.tokenId;
  let token = "";

  try {
    if (updateDb) {
      const existingToken = await prisma.token.findUnique({
        where: { userId: user.id },
      });

      if (existingToken) {
        await prisma.token.delete({
          where: { id: existingToken.id },
        });
      }

      const newToken = await prisma.token.upsert({
        where: { userId: user.id },
        update: {
          token: jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            REFRESH_TOKEN_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
          ),
        },
        create: {
          userId: user.id,
          token: jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            REFRESH_TOKEN_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
          ),
        },
      });

      refreshTokenId = newToken.id;
      token = newToken.token;
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tokenId: refreshTokenId,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    return {
      accessToken,
      refreshToken: token,
    };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ErrorHandler("Failed to generate tokens", 500);
  }
}

export default generateTokens;
