import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  // El token se envía en el encabezado Authorization: Bearer <token>
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const secret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(token, secret);

    (req as any).userId = (decoded as any).id;

    next(); // Continuar al siguiente middleware o controlador
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .json({
          message: "Token expirado, por favor inicie sesión nuevamente",
        });
    } else {
      return res
        .status(401)
        .json({ message: "Token inválido o no autorizado" });
    }
  }
}
