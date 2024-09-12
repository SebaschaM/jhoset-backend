import express from "express";
import {
  listUsers,
  createUser,
  createShift,
  disableUser,
  updateUser,
  deleteUser,
  enableUser,
} from "../controllers/adminController";

const router = express.Router();

router.get("/list-users", listUsers);
router.post("/create-user", createUser);
router.put("/update-user/:user_id", updateUser);
router.delete("/delete-user", deleteUser);
router.put("/disable-user/:user_id", disableUser);
router.put("/enable-user/:user_id", enableUser);

router.post("/create-shift", createShift);

export default router;
