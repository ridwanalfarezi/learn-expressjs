import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

const REDIS_URL = process.env.REDIS_URL;

export {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  PORT,
  REDIS_URL,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  SERVER_URL,
};
