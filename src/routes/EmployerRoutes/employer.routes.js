import express from "express";
import {
    createEmployer,
    loginEmployer,
    logOutEmployer,
} from "../../controllers/Company/employer.controller.js";
import {
    deleteJobApplication,
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

// job application routes //
router.route("/job").post(verifyJWTEmployer, postApplication);
router.route("/job").get(verifyJWTEmployer, getMyApplications);
router.route("/job/:id").delete(deleteJobApplication);
// job application routes //

// end of validation routes //
export default router;
