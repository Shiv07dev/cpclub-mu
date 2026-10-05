import prisma from "../config/prisma";
import { AuditAction } from "@prisma/client";
import { deserializeAuditLog } from "../utils/mysql";

export const auditService = {
  async log(
    adminId: string,
    action: AuditAction,
    entity: string,
    entityId?: string,
    details?: Record<string, unknown>,
    ipAddress?: string
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          adminId,
          action,
          entity,
          entityId: entityId ?? null,
          detailsJson: details ? JSON.stringify(details) : null,
          ipAddress: ipAddress ?? null,
        },
      });
    } catch {
      // Audit logging failures must not break business logic
    }
  },

  async list(params: { adminId?: string; entity?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 50 } = params;
    const where: Record<string, unknown> = {};
    if (params.adminId) where["adminId"] = params.adminId;
    if (params.entity) where["entity"] = params.entity;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { admin: { select: { name: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((l) => deserializeAuditLog(l as unknown as Record<string, unknown>)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },
};
