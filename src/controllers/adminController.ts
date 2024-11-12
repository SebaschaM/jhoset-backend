import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Role } from "../enum/Role.enum";
import { encryptPassword } from "../utils/passwordUtils";
import { errorResponse, successResponse } from "../utils/responseUtils";
import { UserResponse } from "../interfaces/responses.interface";

const prisma = new PrismaClient();

export const createUserEmployee = async (req: Request, res: Response) => {
  const { username, email, password, dni, name, last_name, role_id } = req.body;

  // Validar que se hayan enviado todos los datos necesarios
  if (!username || !email || !password || !dni || !name || !last_name || !role_id) {
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

    // Verificar si el email ya existe (si es necesario)
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return errorResponse(res, 400, "El email ya está en uso");
    }

    // Verificar si el DNI ya existe (si es necesario)
    const existingDni = await prisma.user.findUnique({
      where: { dni: Number(dni) },
    });
    if (existingDni) {
      return errorResponse(res, 400, "El DNI ya está registrado");
    }

    // Encriptar la contraseña
    const hashedPassword = await encryptPassword(password);

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        dni: Number(dni),
        name,
        last_name,
        role_id: Number(role_id),
      },
    });

    // Respuesta exitosa
    return successResponse(res, 201, "Usuario creado exitosamente", newUser);
  } catch (error) {
    console.error(error); // Usar console.error para errores
    return errorResponse(res, 500, "Error al crear el usuario");
  }
};


export  const modifyUserEmployee = async (req: Request, res: Response) => {
  const { user_id, username, email, dni, name, last_name, role_id } = req.body;

  if (!user_id) {
    return errorResponse(res, 400, "Faltan datos para modificar el usuario");
  }

  try {
    // Validar si ya existe un usuario con el mismo username (excepto el que estamos modificando)
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: username,
        email: email,
        dni: Number(dni),
        user_id: {
          not: Number(user_id), // Asegurar que no sea el mismo usuario
        },
      },
    });

    if (existingUsername) {
      return errorResponse(res, 400, "Usuario existente");
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
        role_id: Number(role_id),
      },
    });

    return successResponse(res, 200, "Usuario modificado correctamente");
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error al modificar usuario",
      (error as Error).message
    );
  }
};

export const deleteUserEmployee = async (req: Request, res: Response) => {
  const { user_id } = req.params;

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
    return errorResponse(
      res,
      500,
      "Error al eliminar usuario",
      (error as Error).message
    );
  }
};

export const getUserEmployee = async (req: Request, res: Response) => {
  const { user_id } = req.params;

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
        dni: true,
        email: true,
        name: true,
        last_name: true,
        role_id: true,
      },
    });

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    const response: UserResponse = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      dni: user.dni,
      name: user.name,
      last_name: user.last_name,
      role_id: user.role_id,
    };

    return successResponse(res, 200, "Usuario encontrado", response);
  } catch (error) {
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
    return errorResponse(
      res,
      500,
      "Error al obtener usuarios",
      (error as Error).message
    );
  }
};

export const getAllEmployeeActive = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
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
        shift_id: true,
      },
    });

    const response: UserResponse[] = users.map((user) => {
      return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        name: user.name,
        last_name: user.last_name,
        shift_id: user.shift_id,
      };
    });

    return successResponse(res, 200, "Usuarios activos encontrados", response);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error al obtener usuarios activos",
      (error as Error).message
    );
  }
}

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
    return errorResponse(
      res,
      500,
      "Error al activar usuario",
      (error as Error).message
    );
  }
};

/*
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
*/
