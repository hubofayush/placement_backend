import express from "express";
import {
    createEmployer,
    loginEmployer,
} from "../../controllers/Company/employer.controller.js";
import { postApplication } from "../../controllers/job/employerApplication.controller.js";
import { verifyJWTEmployer } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// simpler roueters //
router.route("/register").post(createEmployer);
router.route("/login").post(loginEmployer);
// end of  simpler roueters //

// validation routes //
router.route("/job").post(verifyJWTEmployer, postApplication);
// end of validation routes //
export default router;
