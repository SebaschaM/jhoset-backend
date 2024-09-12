import { Request, Response, NextFunction } from "express";
import { logHttpRequest } from "../utils/logger";

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logHttpRequest(req.method, req.url, res.statusCode, duration);
  });

  next();
};

export default requestLogger;
