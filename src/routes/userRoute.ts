import express from "express";
import {
  markAttendance,
  createUserEmployee,
  modifyUserEmployee,
  deleteUserEmployee,
  getUserEmployee,
  getAllUsersEmployee,
  deactivateUserEmployee,
  activateUserEmployee,
} from "../controllers/userController";

const router = express.Router();

router.post("/mark-attendance", markAttendance);
router.post("/create-employee", createUserEmployee);
router.put("/modify-employee", modifyUserEmployee);
router.delete("/delete-employee", deleteUserEmployee);
router.get("/get-employee", getUserEmployee);
router.get("/get-all-employee", getAllUsersEmployee);
router.put("/deactivate-employee", deactivateUserEmployee);
router.put("/activate-employee", activateUserEmployee);

export default router;
