import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(
  cors({
    origin: `${process.env.ORIGIN}`,
    credentials: true,
  })
);
app.use(cookieParser());

// importing routes
import sendOtpRouter from "./routes/sendOTP.Routes.js";
// end of importing routes

// apis / routes
app.use("/api/v1/emp", sendOtpRouter);
// end of apis / routes

export { app };
