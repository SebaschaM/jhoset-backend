import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function generateDynamicQR(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no está definido en el archivo .env");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN_QR;

  const payload = {
    timestamp: Date.now(),
  };

  const token = jwt.sign(payload, secret, { expiresIn });

  return token;
}
