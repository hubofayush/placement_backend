import express from "express";
import { createEmployer } from "../../controllers/Company/employer.controller.js";

const router = express.Router();

// simpler roueters //
router.route("/register").post(createEmployer);
// end of  simpler roueters //

export default router;
