import express from "express";
import {
    createEmployer,
    loginEmployer,
} from "../../controllers/Company/employer.controller.js";

const router = express.Router();

// simpler roueters //
router.route("/register").post(createEmployer);
router.route("/login").post(loginEmployer);
// end of  simpler roueters //

export default router;
