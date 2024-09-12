import express from "express";
import { markAttendance } from "../controllers/userController";

const router = express.Router();

router.post("/mark-attendance", markAttendance);

export default router;
