import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

async function connectDb() {
  console.log(`${process.env.MONGO_URL}`);
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URL}${DB_NAME}`
    );
    console.log(`
        \n mongodb connected DB host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("Mongo DB connection error", error);
    process.exit(1);
  }
}

export default connectDb;
