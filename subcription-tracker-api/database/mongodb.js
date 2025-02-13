import mongoose from "mongoose";
import { MONGO_URI, NODE_ENV } from "../config/env.js";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined. Check your .env file.");
}

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB in ${NODE_ENV} mode`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);

    process.exit(1);
  }
};

export default connectToDatabase;
