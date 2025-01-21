import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AUTH_MESSAGES from "../messages/auth.js";
import { prisma } from "../prisma/prisma.js";

async function login(username, password) {
  const user = await prisma.user.findUnique({
    where: { username: username },
  });

  if (!user) return { message: AUTH_MESSAGES.INVALID_CREDENTIALS };

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) return { message: AUTH_MESSAGES.INVALID_CREDENTIALS };

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return { message: AUTH_MESSAGES.LOGIN_SUCCESS, token };
}

async function register(username, password, confirmPassword) {
  if (password.length < 8) return { message: AUTH_MESSAGES.PASSWORD_LENGTH };
  if (password !== confirmPassword)
    return { message: AUTH_MESSAGES.PASSWORD_MISMATCH };

  const checkUser = await prisma.user.findUnique({
    where: { username: username },
  });

  if (checkUser) return { message: AUTH_MESSAGES.EXISTED_USER };

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  if (result.id) return { message: AUTH_MESSAGES.REGISTER_SUCCESS };
  return { message: AUTH_MESSAGES.ERR_REGISTER };
}

export { login, register };
