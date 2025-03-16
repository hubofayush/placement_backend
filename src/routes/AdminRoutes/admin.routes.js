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
    toggleEmployeeStatus,
} from "../../controllers/admin/admin.employee.controller.js";

const router = new Router();

router.route("/auth/register").post(registerAdmin);
router.route("/auth/login").post(loginAdmin);

// secured routes //
router.route("/auth/updatePassword").patch(verifyAdmin, updateAdminPassword);

// employee routes //
router.route("/employees").get(verifyAdmin, getAllEmployees);
router
    .route("/employees/:employeeId")
    .delete(verifyAdmin, deleteEmployee)
    .patch(verifyAdmin, toggleEmployeeStatus);
// end of employee routes //
// secured routes //

export default router;
