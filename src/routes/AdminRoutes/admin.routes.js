import { Router } from "express";
import {
    loginAdmin,
    registerAdmin,
    updateAdminPassword,
} from "../../controllers/admin/admin.auth.controller.js";
import { verifyAdmin } from "../../middlewares/auth.middleware.js";
import {
    deleteEmployee,
    getAllEmployees,
    getBlockedEmployees,
    toggleEmployeeStatus,
    viewAdminSingleEmployee,
} from "../../controllers/admin/admin.employee.controller.js";
import {
    getDashboardStats,
    getPerformanceTracking,
} from "../../controllers/admin/admin.analytics.controller.js";
import {
    deleteEmployer,
    getAllEmployers,
    getBlockedEmployers,
    toggleEmployerStatus,
    viewAdminSingleEmployer,
} from "../../controllers/admin/admin.employer.controller.js";
import {
    changeApplicationStatus,
    getActiveApplications,
    getAllJobApplications,
    getDeactiveApplications,
    viewAdminSingleJobApplication,
} from "../../controllers/admin/admin.jobapplication.controller.js";
import { advancedSearch } from "../../controllers/admin/admin.search.controller.js";

const router = new Router();

router.route("/auth/register").post(registerAdmin);
router.route("/auth/login").post(loginAdmin);

// secured routes //
router.route("/auth/updatePassword").patch(verifyAdmin, updateAdminPassword);

// employee routes //
router.route("/employees").get(verifyAdmin, getAllEmployees);
router.route("/employees/blocked").get(verifyAdmin, getBlockedEmployees);
router
    .route("/employees/:employeeId")
    .get(verifyAdmin, viewAdminSingleEmployee)
    .delete(verifyAdmin, deleteEmployee)
    .patch(verifyAdmin, toggleEmployeeStatus);
// end of employee routes //

// dashboard analytics //
router.route("/analytics/dashboard").get(verifyAdmin, getDashboardStats);
router.route("/analytics/performance").get(verifyAdmin, getPerformanceTracking);
// end of dashboard analytics //

// employer routes //
router.route("/employers").get(verifyAdmin, getAllEmployers);
router.route("/employers/blocked").get(verifyAdmin, getBlockedEmployers);
router
    .route("/employer/:employerId")
    .get(verifyAdmin, viewAdminSingleEmployer)
    .delete(verifyAdmin, deleteEmployer)
    .patch(verifyAdmin, toggleEmployerStatus);
// end of employer routes //

// job applications //
router.route("/jobApplications").get(verifyAdmin, getAllJobApplications);
router.route("/jobApplications/active").get(verifyAdmin, getActiveApplications);
router
    .route("/jobApplications/deactive")
    .get(verifyAdmin, getDeactiveApplications);

router
    .route("/jobApplication/:jobApplicationID")
    .get(verifyAdmin, viewAdminSingleJobApplication)
    .patch(verifyAdmin, changeApplicationStatus);
// end of job applications //

// advance search //
router.route("/search").get(verifyAdmin, advancedSearch);
// end of advance search //
// secured routes //

export default router;
