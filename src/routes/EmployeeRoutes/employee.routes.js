import { Router } from "express";

import { upload } from "../../middlewares/multer.middleware.js";
import {
    getCurrentUser,
    loginEmployee,
    logoutEmployee,
    Register,
    search,
    updateEmployee,
    updatePassword,
    viewCompany,
} from "../../controllers/Employee/employee.controller.js";
const router = Router();
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import {
    getAllApplications,
    postApplication,
    viewJobApplication,
} from "../../controllers/job/employeeApplication.controller.js";

/**
 * INSECURED ROUTES
 */
router.route("/register").post(upload.single("avatar"), Register);
router.route("/login").get(loginEmployee);
router.route("/").get(getAllApplications);
/**
 *  END OF INSECURED ROUTES
 */

/**
 * SECURED ROUTES
 */
router.route("/logout").post(verifyJWT, logoutEmployee);
router.route("/getUser").get(verifyJWT, getCurrentUser);
router.route("/updateUser").patch(verifyJWT, updateEmployee);
router.route("/updatePassword").patch(verifyJWT, updatePassword);
router.route("/search").get(verifyJWT, search);
router.route("/search/company/:companyId").get(verifyJWT, viewCompany);

// job application routes //
router
    .route("/job/:jobId")
    .post(verifyJWT, upload.single("resume"), postApplication)
    .get(verifyJWT, viewJobApplication);
// end of job application routes //
/**
 *  END OF SECURED ROUTES
 */
export default router;
