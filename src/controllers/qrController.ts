import { Request, Response } from "express";
import * as qrcode from "qrcode";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse } from "../utils/responseUtils";
import { generateDynamicQR } from "../utils/generateDynamicQR";

dotenv.config();

export const generateTokenQR = async (_req: Request, res: Response) => {
  try {
    const token = generateDynamicQR();

    res.setHeader("X-QR-Token", token);
    //console.log(token)
    return successResponse(res, 200, "Token QR generado correctamente", {});
  } catch (error) {
    return errorResponse(res, 500, "Error al generar el código QR");
  }
};

export const generateQR = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return errorResponse(
        res,
        401,
        "Acceso no autorizado, token no proporcionado"
      );
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
      return errorResponse(
        res,
        401,
        "Formato de token inválido. Usa el formato 'Bearer <token>'"
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_secret"
      );
      console.log("Token verificado correctamente:", decoded);
    } catch (error) {
      return errorResponse(
        res,
        401,
        "Token de autenticación no válido o expirado"
      );
    }

    const qrImageURL = generateDynamicQR();

    const urlBase = process.env.QR_URL_BASE;

    const qrData = `${urlBase}?token=${qrImageURL}`;

    const qrCode = await qrcode.toDataURL(qrData);

    return successResponse(res, 200, "Código QR generado correctamente", {
      qrCode,
    });
  } catch (error) {
    return errorResponse(res, 500, "Error al generar el código QR");
  }
};

export const validateQR = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return errorResponse(res, 400, "Token no proporcionado en la cabecera");
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
      return errorResponse(res, 400, "Formato de token inválido");
    }

    try {
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        return errorResponse(res, 500, "JWT secret no definido");
      }

      await jwt.verify(token, secret);

      return successResponse(res, 200, "Token QR válido");
    } catch (error) {
      return errorResponse(res, 401, "Token QR inválido o expirado");
    }
  } catch (error) {
    return errorResponse(res, 500, "Error interno del servidor");
  }
};
