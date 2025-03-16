import { Router } from "express";
import {
    loginAdmin,
    registerAdmin,
    updateAdminPassword,
} from "../../controllers/admin/admin.auth.controller.js";
import { verifyAdmin } from "../../middlewares/auth.middleware.js";

const router = new Router();

router.route("/auth/register").post(registerAdmin);
router.route("/auth/login").post(loginAdmin);

// secured routes //
router.route("/auth/updatePassword").patch(verifyAdmin, updateAdminPassword);
// secured routes //

export default router;
