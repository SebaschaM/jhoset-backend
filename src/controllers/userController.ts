import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { successResponse, errorResponse } from "../utils/responseUtils";
import {
  UserResponse,
} from "../interfaces/responses.interface";
import { encryptPassword } from "../utils/passwordUtils";

const prisma = new PrismaClient();

export const markAttendance = async (req: Request, res: Response) => {
  const { dni, attendanceDate } = req.body;

  if (!dni || !attendanceDate) {
    return errorResponse(res, 400, "Faltan datos para marcar la asistencia");
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        dni: Number(dni),
      },
    });

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    const user_id = user.user_id;

    const convertToLocaleString = (date: string) => {
      const dateObj = new Date(date);
      return dateObj.toLocaleString();
    };

    const responseDate = convertToLocaleString(attendanceDate);
    const time = responseDate.split(", ")[1];
    const date_marked = responseDate.split(", ")[0];

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        user_id: Number(user_id),
        date_marked: date_marked,
      },
    });

    if (existingAttendance) {
      return errorResponse(
        res,
        400,
        "Ya se ha registrado asistencia para este usuario en este día"
      );
    }

    await prisma.attendance.create({
      data: {
        user_id: Number(user_id),
        check_in_time: time,
        date_marked: date_marked,
        attendanceStatus_id: 1,
      },
    });

    return successResponse(res, 201, "Asistencia marcada correctamente");
  } catch (error) {
    console.error("Error al marcar asistencia:", error);
    return errorResponse(
      res,
      500,
      "Error al marcar asistencia",
      (error as Error).message
    );
  }
};

export const createUserEmployee = async (req: Request, res: Response) => {
  const { username, email, password, dni, name, last_name, role_id } = req.body;

  // Validar que se hayan enviado todos los datos necesarios
  if (
    !username ||
    !email ||
    !password ||
    !dni ||
    !name ||
    !last_name ||
    !role_id
  ) {
    return errorResponse(res, 400, "Todos los campos son obligatorios");
  }

  try {
    // Verificar si el username ya existe
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return errorResponse(res, 400, "El nombre de usuario ya está en uso");
    }

    // Verificar si el email ya existe
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return errorResponse(res, 400, "El email ya está en uso");
    }

    // Verificar si el dni ya existe
    const existingDni = await prisma.user.findUnique({
      where: { dni: Number(dni) },
    });
    if (existingDni) {
      return errorResponse(res, 400, "El DNI ya está en uso");
    }

    // Encriptar la contraseña
    const hashedPassword = await encryptPassword(password);

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: String(hashedPassword),
        dni: Number(dni),
        name,
        last_name,
        role_id: Number(role_id),
      },
    });

    // Respuesta exitosa
    return successResponse(res, 201, "Usuario creado exitosamente", newUser);
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    return errorResponse(
      res,
      500,
      "Error al crear el usuario",
      (error as Error).message
    );
  }
};

export const modifyUserEmployee = async (req: Request, res: Response) => {
  const { user_id, username, email, dni, name, last_name, role_id } = req.body;

  if (!user_id) {
    return errorResponse(res, 400, "Faltan datos para modificar el usuario");
  }

  try {
    // Validar si ya existe un usuario con el mismo username (excepto el que estamos modificando)
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: username,
        user_id: {
          not: Number(user_id), // Asegurar que no sea el mismo usuario
        },
      },
    });
    if (existingUsername) {
      return errorResponse(
        res,
        400,
        "El nombre de usuario ya está en uso por otro usuario"
      );
    }

    // Validar si ya existe un usuario con el mismo email (excepto el que estamos modificando)
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: email,
        user_id: {
          not: Number(user_id), // Asegurar que no sea el mismo usuario
        },
      },
    });
    if (existingEmail) {
      return errorResponse(
        res,
        400,
        "El correo electrónico ya está en uso por otro usuario"
      );
    }

    // Actualizar el usuario
    await prisma.user.update({
      where: {
        user_id: Number(user_id),
      },
      data: {
        username,
        email,
        dni: Number(dni),
        name,
        last_name,
      },
    });

    return successResponse(res, 200, "Usuario modificado correctamente");
  } catch (error) {
    console.error("Error al modificar usuario:", error);
    return errorResponse(
      res,
      500,
      "Error al modificar usuario",
      (error as Error).message
    );
  }
};

export const deleteUserEmployee = async (req: Request, res: Response) => {
  const { user_id } = req.body;

  if (!user_id) {
    return errorResponse(res, 400, "Faltan datos para eliminar el usuario");
  }

  try {
    await prisma.user.delete({
      where: {
        user_id: Number(user_id),
      },
    });

    return successResponse(res, 200, "Usuario eliminado correctamente");
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return errorResponse(
      res,
      500,
      "Error al eliminar usuario",
      (error as Error).message
    );
  }
};

export const getUserEmployee = async (req: Request, res: Response) => {
  const { user_id } = req.query;

  if (!user_id) {
    return errorResponse(res, 400, "Faltan datos para obtener el usuario");
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        user_id: Number(user_id),
        username: {
          not: "admin", // Excluir usuarios con el username 'admin'
        },
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        name: true,
        last_name: true,
        isActive: true,
      },
    });

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    const response: UserResponse = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      name: user.name,
      last_name: user.last_name,
      isActive: user.isActive,
    };

    return successResponse(res, 200, "Usuario encontrado", response);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return errorResponse(
      res,
      500,
      "Error al obtener usuario",
      (error as Error).message
    );
  }
};

export const getAllUsersEmployee = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          not: "admin", // Excluir usuarios con el username 'admin'
        },
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        name: true,
        last_name: true,
        isActive: true,
      },
    });

    const response: UserResponse[] = users.map((user) => {
      return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        name: user.name,
        last_name: user.last_name,
        isActive: user.isActive,
      };
    });

    return successResponse(res, 200, "Usuarios encontrados", response);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return errorResponse(
      res,
      500,
      "Error al obtener usuarios",
      (error as Error).message
    );
  }
};

export const deactivateUserEmployee = async (req: Request, res: Response) => {
  const { user_id } = req.body;

  if (!user_id) {
    return errorResponse(res, 400, "Faltan datos para desactivar el usuario");
  }

  try {
    await prisma.user.update({
      where: {
        user_id: Number(user_id),
      },
      data: {
        isActive: false,
      },
    });

    return successResponse(res, 200, "Usuario desactivado correctamente");
  } catch (error) {
    console.error("Error al desactivar usuario:", error);
    return errorResponse(
      res,
      500,
      "Error al desactivar usuario",
      (error as Error).message
    );
  }
};

export const activateUserEmployee = async (req: Request, res: Response) => {
  const { user_id } = req.body;

  if (!user_id) {
    return errorResponse(res, 400, "Faltan datos para activar el usuario");
  }

  try {
    await prisma.user.update({
      where: {
        user_id: Number(user_id),
      },
      data: {
        isActive: true,
      },
    });

    return successResponse(res, 200, "Usuario activado correctamente");
  } catch (error) {
    console.error("Error al activar usuario:", error);
    return errorResponse(
      res,
      500,
      "Error al activar usuario",
      (error as Error).message
    );
  }
};
