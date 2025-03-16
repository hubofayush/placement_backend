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
router.route("analytics/dashboard").get(verifyAdmin, getDashboardStats);
router.route("/analytics/performance").get(verifyAdmin, getPerformanceTracking);
// end of dashboard analytics //
// secured routes //

export default router;
