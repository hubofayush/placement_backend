import express from "express";
import {
    createEmployer,
    loginEmployer,
    logOutEmployer,
} from "../../controllers/Company/employer.controller.js";
import {
    getMyApplications,
    postApplication,
} from "../../controllers/job/employerApplication.controller.js";
import { verifyJWTEmployer } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// simpler roueters //
router.route("/register").post(createEmployer);
router.route("/login").post(loginEmployer);
// end of  simpler roueters //

// validation routes //
router.route("/logout").get(verifyJWTEmployer, logOutEmployer);
router.route("/job").post(verifyJWTEmployer, postApplication);
router.route("/job").get(verifyJWTEmployer, getMyApplications);

// end of validation routes //
export default router;
