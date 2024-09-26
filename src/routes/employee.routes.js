import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import { loginEmployee, Register } from "../controllers/employee.controller.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), Register);
router.route("/login").get(loginEmployee);

export default router;
