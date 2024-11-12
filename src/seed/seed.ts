import { PrismaClient } from "@prisma/client";
import { Role } from "../enum/Role.enum";
import dotenv from "dotenv";
import { logInfo, logWarning, logError } from "../utils/logger";
import { encryptPassword } from "../utils/passwordUtils";

dotenv.config();
const prisma = new PrismaClient();

export async function runSeed() {
  try {
    const roles = await prisma.role.findMany({
      where: {
        role_name: { in: ["Admin", "Employee", "Manager"] },
      },
    });

    if (roles.length === 0) {
      await prisma.role.createMany({
        data: [
          { role_name: "Admin" },
          { role_name: "Employee" },
          { role_name: "Manager" },
        ],
        skipDuplicates: true,
      });
      logInfo("Roles creados con éxito.");
    } else {
      logInfo("Los roles ya existen, no se insertarán duplicados.");
    }

    const statuses = await prisma.attendanceStatus.findMany({
      where: {
        status_name: { in: ["Presente", "Ausente", "Tarde"] },
      },
    });

    if (statuses.length === 0) {
      await prisma.attendanceStatus.createMany({
        data: [
          { status_name: "Presente" },
          { status_name: "Ausente" },
          { status_name: "Tarde" },
        ],
        skipDuplicates: true,
      });
      logInfo("Estados de asistencia creados con éxito.");
    } else {
      logInfo(
        "Los estados de asistencia ya existen, no se insertarán duplicados."
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;
    const adminLastName = process.env.ADMIN_LAST_NAME;
    const adminDni = process.env.ADMIN_DNI;
    const adminIsActive = process.env.ADMIN_IS_ACTIVE;

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      logWarning("Faltan variables de entorno críticas para el usuario admin.");
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!adminUser) {
      await prisma.user.create({
        data: {
          username: String(adminUsername),
          email: String(adminEmail),
          password: String(await encryptPassword(String(adminPassword))),
          name: String(adminName),
          last_name: String(adminLastName),
          role_id: Role.ADMIN,
          dni: Number(adminDni),
          isActive: true,
        },
      });
      logInfo("Usuario admin creado con éxito.");
    } else {
      logInfo("El usuario admin ya existe, no se insertará un duplicado.");
    }

    const shiftTypes = await prisma.shift.findMany({
      where: {
        shift_start: "08:00 AM",
      },
    });

    if (shiftTypes.length === 0) {
      await prisma.shift.createMany({
        data: [
          { shift_start: "08:00 AM", shift_end: "04:00 PM" },
          { shift_start: "09:00 AM", shift_end: "05:00 PM" },
          { shift_start: "10:00 AM", shift_end: "06:00 PM" },
        ],
        skipDuplicates: true,
      });
      logInfo("Turnos creados con éxito.");
    } else {
      logInfo("Los turnos ya existen, no se insertarán duplicados.");
    }
  } catch (error) {
    if (error instanceof Error) {
      logError(error);
    } else {
      logError(new Error(String(error)));
    }
  }
}
