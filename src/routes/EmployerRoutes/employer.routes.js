import express from "express";
import {
    createEmployer,
    loginEmployer,
    logOutEmployer,
    viewProfile,
} from "../../controllers/Company/employer.controller.js";
import {
    changeJobStatus,
    deleteJobApplication,
    getMyApplications,
    postApplication,
    shortListApplication,
    updateJobApplication,
    viewJobApplicationsRequests,
    viewShortlistedApplications,
    viewSingleApplication,
} from "../../controllers/job/employerApplication.controller.js";
import { verifyJWTEmployer } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";

const router = express.Router();

// simpler roueters //
router.route("/register").post(upload.single("logo"), createEmployer);
router.route("/login").post(loginEmployer);
// end of  simpler roueters //

// validation routes //
router.route("/logout").get(verifyJWTEmployer, logOutEmployer);
router.route("/viewEmployee/:empId").get(verifyJWTEmployer, viewProfile);

/**
 * job application routes
 */
router.route("/job").post(verifyJWTEmployer, postApplication);
router.route("/job").get(verifyJWTEmployer, getMyApplications);
router
    .route("/job/:id")
    .delete(verifyJWTEmployer, deleteJobApplication)
    .patch(verifyJWTEmployer, updateJobApplication);
router.route("/job/toggle/:id").patch(verifyJWTEmployer, changeJobStatus);

router
    .route("/job/application/:id")
    .get(verifyJWTEmployer, viewJobApplicationsRequests);
router
    .route("/job/application/view/:id")
    .get(verifyJWTEmployer, viewSingleApplication);

// shortlist application //
router
    .route("/job/application/shortlist")
    .post(verifyJWTEmployer, shortListApplication);
router
    .route("/job/application/shortlist/:id")
    .get(verifyJWTEmployer, viewShortlistedApplications);
// end of shortlist application //

// job application routes //

// end of validation routes //
export default router;
