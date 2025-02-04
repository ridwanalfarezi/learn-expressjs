import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../env";

const prisma = new PrismaClient();

const verifyRefreshToken = async (
  token: string
): Promise<{ error?: string; tokenDetails?: Record<string, any> }> => {
  let userId: string;

  try {
    const decodedToken = jwt.verify(token, REFRESH_TOKEN_SECRET) as Record<
      string,
      any
    >;
    userId = decodedToken.id;
  } catch (err) {
    return { error: "Invalid token" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { error: "Invalid token" };
  }

  try {
    const tokenDetails = jwt.verify(token, REFRESH_TOKEN_SECRET) as Record<
      string,
      any
    >;
    return { tokenDetails };
  } catch (err) {
    return { error: "Invalid token" };
  }
};

export default verifyRefreshToken;
