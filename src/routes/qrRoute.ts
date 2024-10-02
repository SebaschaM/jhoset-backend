import { Router } from "express";
import {
  generateQR,
  generateTokenQR,
  validateQR,
} from "../controllers/qrController";

const router = Router();

router.get("/generate-qr", generateQR);
router.get("/generate-token-auth", generateTokenQR);
router.get("/validate-qr", validateQR);

export default router;
