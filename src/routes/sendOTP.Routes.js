import { Router } from "express";
import { sendOtpEmployee } from "../controllers/sendOTP.controller.js";
const router = Router();

// send otp route //
router.route("/otp").post(sendOtpEmployee);
// end of send otp route //

export default router;
