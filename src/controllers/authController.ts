import { Request, Response } from "express";
import { comparePassword } from "../utils/passwordUtils"; // Función para comparar contraseñas encriptadas
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../middleware/generateToken";
import { successResponse, errorResponse } from "../utils/responseUtils"; // Las funciones que hemos creado
import { UserResponse } from "../interfaces/responses.interface";

const prisma = new PrismaClient();

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return errorResponse(res, 400, "Faltan datos");
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, 401, "Contraseña incorrecta");
    }

    const token = generateToken(user.user_id);

    return successResponse<UserResponse>(
      res,
      200,
      "Inicio de sesión exitoso",
      {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        name: user.name,
        last_name: user.last_name,
        isActive: user.isActive,
      },
      token
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      500,
      "Error al iniciar sesión",
      (error as Error).message
    );
  }
};
