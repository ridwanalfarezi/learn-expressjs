import express from "express";
import cors from "cors"
import routes from "./routes/route.js";

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());

app.use("/api", routes);

app.get("/", (req, res) => {
   res.status(200).send({ msg: "API docs at /api" });
});

app.listen(port, () => {
   console.log(`Server running on [http://127.0.0.1:${port}]. \nPress Ctrl+C to stop the server`);
});