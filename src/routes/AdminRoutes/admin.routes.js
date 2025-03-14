import { Router } from "express";
import { registerAdmin } from "../../controllers/admin/admin.auth.controller.js";

const router = new Router();

router.route("/auth/register").post(registerAdmin);

export default router;
