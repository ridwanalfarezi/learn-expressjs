import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import prisma from "../prisma/client/index.js";

config({ path: ".env" });


// Registrasi user
const registerUser = async (req, res) => {
  const { username, password, email } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      email,
    },
  });

  res.status(201).json({ message: "User created successfully" });
};

// Login user
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign(
    { username: user.username, id: user.id },
    process.env.JWT_SECRET
  );
  res.json({ accessToken, message: "Login successful" });
};

export { registerUser, loginUser };
