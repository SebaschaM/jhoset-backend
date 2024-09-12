import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { successResponse, errorResponse } from "../utils/responseUtils";
import { AttendanceResponse } from "../interfaces/responses.interface";

const prisma = new PrismaClient();

export const markAttendance = async (req: Request, res: Response) => {
  const { user_id, check_in_time } = req.body;

  // Validar que se hayan enviado los datos necesarios
  if (!user_id || !check_in_time) {
    return errorResponse(res, 400, "Faltan datos para marcar la asistencia");
  }

  try {
    // Crear el registro de asistencia
    const attendance = await prisma.attendance.create({
      data: {
        user_id: Number(user_id),
        check_in_time: new Date(check_in_time),
        date_marked: new Date(),
        attendanceStatus_id: 1, // Asume que 1 es el estado "Presente"
      },
    });

    // Retornar una respuesta exitosa con los datos de la asistencia
    return successResponse<AttendanceResponse>(
      res,
      201,
      "Asistencia marcada correctamente",
      {
        attendance_id: attendance.attendance_id,
        user_id: attendance.user_id,
        check_in_time: attendance.check_in_time,
        date_marked: attendance.date_marked,
        attendanceStatus_id: attendance.attendanceStatus_id,
      }
    );
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
