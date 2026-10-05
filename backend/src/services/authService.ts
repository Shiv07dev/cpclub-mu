import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config";
import prisma from "../config/prisma";
import { JwtPayload } from "../types";
import { UnauthorizedError, NotFoundError } from "../middleware/error";

const SALT_ROUNDS = 12;

export const authService = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  generateAccessToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  },

  generateRefreshToken(): string {
    return uuidv4();
  },

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }
  },

  async login(email: string, password: string) {
    const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!admin || !admin.isActive) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await this.comparePassword(password, admin.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid credentials");

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = this.generateAccessToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: { token: refreshToken, adminId: admin.id, expiresAt },
    });

    return {
      token: accessToken,
      refreshToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  },

  async refresh(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { admin: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    if (!stored.admin.isActive) throw new UnauthorizedError("Account inactive");

    const accessToken = this.generateAccessToken({
      adminId: stored.admin.id,
      email: stored.admin.email,
      role: stored.admin.role,
    });

    return { token: accessToken };
  },

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
  },

  async getMe(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true, role: true, lastLoginAt: true, createdAt: true },
    });
    if (!admin) throw new NotFoundError("Admin");
    return admin;
  },
};
