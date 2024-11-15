import { Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { successResponse, errorResponse } from "../utils/responseUtils";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

dotenv.config();

export const markAttendance = async (req: Request, res: Response) => {
  const { dni, attendanceDate, attendanceHour } = req.body;

  const authHeader = req.headers.authorization;
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return errorResponse(res, 500, "JWT secret no definido");
  }

  if (!dni || !attendanceDate) {
    return errorResponse(res, 400, "Faltan datos para marcar la asistencia");
  }

  if (!authHeader) {
    return errorResponse(res, 400, "Token no proporcionado en la cabecera");
  }

  const [bearer, token] = authHeader.split(" ");

  if (bearer !== "Bearer" || !token) {
    return errorResponse(res, 400, "Formato de token inválido");
  }

  try {
    jwt.verify(token, secret);
  } catch (error) {
    return errorResponse(res, 401, "Token inválido o expirado");
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        dni: Number(dni),
        isActive: true,
      },
    });

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    const user_id = user.user_id;
    const shifUser = user.shift_id;

    if (shifUser == null) {
      return errorResponse(res, 404, "Usuario no tiene un turno asignado");
    }

    const existShift = await prisma.shift.findFirst({
      where: {
        shift_id: shifUser,
      },
    });

    const shiftStart = existShift?.shift_start; // Ejemplo: '08:00 AM'
    console.log("Hora registrada del turno (shiftStart):", shiftStart);
    console.log(
      "Hora de marcación de asistencia (attendanceHour):",
      attendanceHour
    ); // Ejemplo: '2:00 AM'

    // Lógica para determinar si llegó temprano o tarde
    const convertToDate = (time: string) => {
      const [hours, minutes, period] = time
        .match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i)!
        .slice(1);
      let hours24 = parseInt(hours);
      if (period.toUpperCase() === "PM" && hours24 !== 12) hours24 += 12;
      if (period.toUpperCase() === "AM" && hours24 === 12) hours24 = 0;
      const date = new Date();
      date.setHours(hours24, parseInt(minutes), 0);
      return date;
    };

    const shiftStartDate = convertToDate(shiftStart!);
    const attendanceDateTime = convertToDate(attendanceHour);

    let attendanceStatusId = 1; // Por defecto, asumimos que llegó temprano o a tiempo

    if (attendanceDateTime > shiftStartDate) {
      attendanceStatusId = 3; // Si llegó tarde, el estado es 3
      console.log("Llegó tarde");
    }

    // Continuar con el resto de la lógica para registrar la asistencia...
    const responseDate = new Date(attendanceDate).toLocaleString();
    console.log(
      "Fecha de marcación de asistencia (responseDate):",
      responseDate
    );
    const time = responseDate.split(", ")[1];
    const date_marked = responseDate.split(", ")[0];


    // Verificar si ya existe asistencia para el usuario en esa fecha
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        user_id: Number(user_id),
        date_marked: date_marked,
      },
    });

    if (existingAttendance) {
      if (existingAttendance.check_out_time) {
        return errorResponse(
          res,
          400,
          "Asistencia ya registrada para el día de hoy"
        );
      }

      await prisma.attendance.update({
        where: {
          attendance_id: existingAttendance.attendance_id,
        },
        data: {
          check_out_time: time,
        },
      });

      return successResponse(res, 200, "Salida registrada correctamente");
    }

    // Registrar nueva asistencia
    await prisma.attendance.create({
      data: {
        user_id: Number(user_id),
        check_in_time: time,
        date_marked: date_marked,
        attendanceStatus_id: attendanceStatusId, // Usar el status correspondiente
      },
    });

    return successResponse(res, 201, "Asistencia registrada correctamente");
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error al marcar asistencia",
      (error as Error).message
    );
  }
};

export const getShifts = async (req: Request, res: Response) => {
  try {
    const shifts = await prisma.shift.findMany();

    return successResponse(res, 200, "Turnos obtenidos correctamente", shifts);
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error al obtener turnos",
      (error as Error).message
    );
  }
};

export const asignShiftToUser = async (req: Request, res: Response) => {
  const { user_id, shift_id } = req.body;

  if (!user_id || !shift_id) {
    return errorResponse(res, 400, "Faltan datos para asignar el turno");
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        user_id: Number(user_id),
        isActive: true,
      },
    });

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    const shift = await prisma.shift.findFirst({
      where: {
        shift_id: Number(shift_id),
      },
    });

    if (!shift) {
      return errorResponse(res, 404, "Turno no encontrado");
    }

    await prisma.user.update({
      where: {
        user_id: Number(user_id),
      },
      data: {
        shift_id: Number(shift_id),
      },
    });

    return successResponse(res, 200, "Turno asignado correctamente");
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error al asignar turno",
      (error as Error).message
    );
  }
};

export const getAttendaceHistoryByUser = async (
  req: Request,
  res: Response
) => {
  const { user_id } = req.params;

  if (!user_id) {
    return errorResponse(
      res,
      400,
      "Faltan datos para obtener el historial de asistencia"
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        user_id: Number(user_id),
        isActive: true,
      },
    });

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    const attendanceHistory = await prisma.attendance.findMany({
      where: {
        user_id: Number(user_id),
      },
    });

    return successResponse(
      res,
      200,
      "Historial de asistencia obtenido correctamente",
      attendanceHistory
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Error al obtener historial de asistencia",
      (error as Error).message
    );
  }
};
