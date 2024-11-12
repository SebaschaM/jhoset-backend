import express from "express";
import {
  createUserEmployee,
  modifyUserEmployee,
  deleteUserEmployee,
  getAllUsersEmployee,
  deactivateUserEmployee,
  activateUserEmployee,
  getUserEmployee,
  getAllEmployeeActive
} from "../controllers/adminController";

const router = express.Router();

router.get("/list-users", getAllUsersEmployee);
router.get("/list-users-active", getAllEmployeeActive);
router.get("/get-employee/:user_id", getUserEmployee);
router.post("/create-user", createUserEmployee);
router.put("/update-user", modifyUserEmployee);
router.delete("/delete-user/:user_id", deleteUserEmployee);
router.put("/deactivate-user/", deactivateUserEmployee);
router.put("/activate-user/", activateUserEmployee);

//router.post("/create-shift", createShift);

export default router;
