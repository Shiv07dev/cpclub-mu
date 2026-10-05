import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { UnauthorizedError, ForbiddenError } from "./error";
import { JwtPayload } from "../types";

// Extend Express Request to carry admin info
declare global {
  namespace Express {
    interface Request {
      admin?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("No token provided");
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.admin = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token expired");
    }
    throw new UnauthorizedError("Invalid token");
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin) throw new UnauthorizedError();
    if (roles.length > 0 && !roles.includes(req.admin.role)) {
      throw new ForbiddenError(`Requires role: ${roles.join(" or ")}`);
    }
    next();
  };
}

// Async wrapper for route handlers
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Helper to get IP address
export function getIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    "unknown"
  );
}
