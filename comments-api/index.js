import { config } from "dotenv";
import express from "express";
import morgan from "morgan";
import { authRouter } from "./routes/auth.js";
import { commentRouter } from "./routes/comments.js";
import { userRouter } from "./routes/users.js";
const app = express();

config({ path: ".env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", commentRouter);

app.listen(3333, () => {
  console.log("Server is running on port http://localhost:3333");
});
