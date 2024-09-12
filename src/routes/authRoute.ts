import express from "express";
import { loginUser } from "../controllers/authController";

const router = express.Router();

router.post("/auth/login-user", loginUser);

export default router;
