import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import { Register } from "../controllers/employee.controller.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), Register);

export default router;
