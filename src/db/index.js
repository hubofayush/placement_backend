import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

async function connectDb() {
    console.log(`${process.env.MONGO_URL}`);
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGO_URL}${DB_NAME}`,
            {
                serverSelectionTimeoutMS: 1000000, // 30 seconds timeout
                socketTimeoutMS: 45000,
            },
        );
        console.log(`
        \n mongodb connected DB host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Mongo DB connection error", error);
        process.exit(1);
    }
}

export default connectDb;
