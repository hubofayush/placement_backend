import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import {
    getCurrentUser,
    loginEmployee,
    logoutEmployee,
    Register,
    updateEmployee,
    updatePassword,
} from "../controllers/employee.controller.js";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";

/**
 * INSECURED ROUTES
 */
router.route("/register").post(upload.single("avatar"), Register);
router.route("/login").get(loginEmployee);
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
/**
 *  END OF SECURED ROUTES
 */
export default router;
