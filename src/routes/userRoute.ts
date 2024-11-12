import express from "express";
import {
  markAttendance,
  getShifts,
  asignShiftToUser,
  getAttendaceHistoryByUser,
} from "../controllers/userController";

const router = express.Router();

router.post("/mark-attendance", markAttendance);
router.get("/shifts", getShifts);
router.post("/assign-shift", asignShiftToUser);
router.get("/attendance-history/:user_id", getAttendaceHistoryByUser);

export default router;
