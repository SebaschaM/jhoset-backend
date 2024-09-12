import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logger";

const errorLogger = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logError(err); // Registrar el error

  res.status(500).json({ message: "Something went wrong!" });
};

export default errorLogger;
