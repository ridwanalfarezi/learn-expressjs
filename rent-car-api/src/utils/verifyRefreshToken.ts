import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../env";
import prisma from "./prismaClient";

const verifyRefreshToken = async (
  token: string
): Promise<{ error?: string; tokenDetails?: Record<string, any> }> => {
  try {
    // Step 1: Verify JWT signature
    const decodedToken = jwt.verify(token, REFRESH_TOKEN_SECRET) as Record<
      string,
      any
    >;

    // Step 2: Check token exists in database
    const tokenInDb = await prisma.token.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!tokenInDb) {
      return { error: "Invalid or expired token" };
    }

    // Step 3: Return token details
    const tokenDetails = {
      id: tokenInDb.user.id,
      email: tokenInDb.user.email,
      role: tokenInDb.user.role,
      tokenId: tokenInDb.id,
    };

    return { tokenDetails };
  } catch (err) {
    return { error: "Invalid token" };
  }
};

export default verifyRefreshToken;
