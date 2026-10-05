import { Request, Response, NextFunction } from "express";
import { config } from "../config";
import logger from "../config/logger";

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code ?? `HTTP_${statusCode}`;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public details: unknown;
  constructor(message: string, details?: unknown) {
    super(message, 422, "VALIDATION_ERROR");
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

// ─── Central error handler middleware ─────────────────────────────────────────

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError && err.isOperational) {
    const body: Record<string, unknown> = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };
    if (err instanceof ValidationError) {
      (body["error"] as Record<string, unknown>)["details"] = err.details;
    }
    res.status(err.statusCode).json(body);
    return;
  }

  // Unknown / programmer errors — log full detail, return sanitized response
  logger.error("Unhandled error", {
    message: err.message,
    stack: config.isDev ? err.stack : undefined,
  });

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: config.isDev
        ? err.message
        : "An unexpected error occurred. Please try again.",
    },
  });
}

// ─── Not-found handler ────────────────────────────────────────────────────────

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.path} does not exist`,
    },
  });
}
