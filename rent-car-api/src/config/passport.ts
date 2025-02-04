import { PrismaClient, User } from "@prisma/client";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../env";
import generateTokens from "../utils/generateTokens";

const prisma = new PrismaClient();

export function initializePassport(passport: passport.PassportStatic) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback
      ) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error("No email found"), false);
          }

          let user = await prisma.user.findUnique({
            where: { email },
            include: { token: true },
          });

          if (user && user.role === "admin") {
            const {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            } = await generateTokens(
              {
                id: user.id,
                email: user.email,
                role: user.role,
                tokenId: user.token?.id,
              },
              true
            );

            if (user?.token) {
              const existingToken = await prisma.token.findUnique({
                where: { id: user.token.id },
              });

              if (existingToken) {
                await prisma.token.delete({ where: { id: user.token.id } });
              }
            }

            const newToken = await prisma.token.upsert({
              where: { token: newRefreshToken },
              update: { token: newRefreshToken },
              create: {
                userId: user.id,
                token: newRefreshToken,
              },
            });

            return done(null, {
              user,
              tokens: {
                accessToken: newAccessToken,
                refreshToken: newToken.token,
              },
            });
          }

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName,
                role: "customer",
              },
              include: {
                token: true,
              },
            });
          }

          if (user.token) {
            await prisma.token.delete({ where: { id: user.token.id } });
          }

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await generateTokens(
              {
                id: user.id,
                email: user.email,
                role: user.role,
              },
              true
            );

          const newToken = await prisma.token.upsert({
            where: { token: newRefreshToken },
            update: { token: newRefreshToken },
            create: {
              userId: user.id,
              token: newRefreshToken,
            },
          });

          return done(null, {
            user,
            tokens: {
              accessToken: newAccessToken,
              refreshToken: newToken.token,
            },
          });
        } catch (error) {
          console.error("Error in Google Authentication:", error);
          return done(error, false);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id as string);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user as User);
    } catch (error) {
      done(error, null);
    }
  });
}
