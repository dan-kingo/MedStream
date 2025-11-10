import mongoose from "mongoose";
import * as dotenv from "dotenv"
dotenv.config()

import debug from "debug"
const dbDebug = debug("app:db")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI|| process.env.MONGO_LOCAL_URL || "",);
   dbDebug(`🟢 MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    dbDebug('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
