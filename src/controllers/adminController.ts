import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Role } from "../enum/Role.enum";
import { encryptPassword } from "../utils/passwordUtils";
import { errorResponse, successResponse } from "../utils/responseUtils";

const prisma = new PrismaClient();

//USERS
export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role_id: Role.USER,
      },
    });
    return successResponse(res, 200, "Usuarios obtenidos correctamente", users);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);

    // Type Assertion: Afirmamos que el error es de tipo Error y tiene una propiedad 'message'
    return errorResponse(
      res,
      500,
      "Error al obtener los usuarios",
      (error as Error).message
    );
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password, name, last_name, dni } = req.body;

  if (!username || !email || !password || !name || !last_name || !dni) {
    return errorResponse(res, 400, "Faltan datos");
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return errorResponse(res, 409, "El username o email ya están en uso");
    }

    const hashedPassword = await encryptPassword(password);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        dni,
        password: hashedPassword,
        name,
        last_name,
        role_id: Role.USER,
      },
    });

    return successResponse(res, 201, "Usuario creado exitosamente", {
      user_id: newUser.user_id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      last_name: newUser.last_name,
      role_id: newUser.role_id,
      isActive: newUser.isActive,
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error al crear el usuario",
      (error as Error).message
    );
  }
};

export const disableUser = async (req: Request, res: Response) => {
  const { user_id } = req.params;

  try {
    const user = await prisma.user.update({
      where: { user_id: Number(user_id) },
      data: { isActive: false },
    });

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    return successResponse(
      res,
      200,
      "Usuario deshabilitado correctamente",
      user
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error al deshabilitar usuario",
      (error as Error).message
    );
  }
};

export const enableUser = async (req: Request, res: Response) => {
  const { user_id } = req.params;

  try {
    const user = await prisma.user.update({
      where: { user_id: Number(user_id) },
      data: { isActive: true },
    });

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    return successResponse(res, 200, "Usuario habilitado correctamente", user);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error al habilitar usuario",
      (error as Error).message
    );
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const { username, email, name, last_name, password } = req.body;

  try {
    const user = await prisma.user.update({
      where: { user_id: Number(user_id) },
      data: {
        username,
        email,
        name,
        last_name,
        password,
      },
    });

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    return successResponse(res, 200, "Usuario actualizado correctamente", user);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error al actualizar usuario",
      (error as Error).message
    );
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { user_id } = req.params;

  try {
    const user = await prisma.user.delete({
      where: { user_id: Number(user_id) },
    });

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    return successResponse(res, 200, "Usuario eliminado correctamente");
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error al eliminar usuario",
      (error as Error).message
    );
  }
};

//SHIFTS
export const createShift = async (req: Request, res: Response) => {
  const { shift_start, shift_end, user_id } = req.body;

  if (!shift_start || !shift_end || !user_id) {
    return errorResponse(res, 400, "Faltan datos para crear el turno");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { user_id },
    });

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    const shift = await prisma.shift.create({
      data: {
        shift_start: new Date(shift_start),
        shift_end: new Date(shift_end),
        user_id,
      },
    });

    return successResponse(res, 201, "Turno creado exitosamente", shift);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error al crear el turno",
      (error as Error).message
    );
  }
};
