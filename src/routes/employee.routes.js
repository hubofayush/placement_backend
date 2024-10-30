import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import {
    loginEmployee,
    logoutEmployee,
    Register,
} from "../controllers/employee.controller.js";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/register").post(upload.single("avatar"), Register);
router.route("/login").get(loginEmployee);
router.route("/logout").post(verifyJWT, logoutEmployee);
export default router;
