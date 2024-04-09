import express, { Router } from "express";
import { createReports } from "../../controllers/reports";

const router: Router = express.Router();

router.get("/create-report", createReports);

export default router;
