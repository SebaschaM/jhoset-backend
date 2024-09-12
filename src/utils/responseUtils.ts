import { Response } from "express";
import {
  SuccessResponse,
  ErrorResponse,
} from "../interfaces/responses.interface";

export const successResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  token?: string
) => {
  const response: SuccessResponse<T> = {
    statusCode,
    message,
    data,
  };

  if (token) {
    return res.status(statusCode).json({
      ...response,
      token,
    });
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  error?: string
) => {
  const response: ErrorResponse = {
    statusCode,
    message,
    error,
  };

  return res.status(statusCode).json(response);
};
