import type { NextFunction, Request, Response } from "express";
import { canAdminRole } from "@workspace/api-zod";
import { hashSessionToken } from "../lib/auth";
import { getSessionAdmin } from "../lib/repository";

export type AuthenticatedAdmin = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      admin?: AuthenticatedAdmin;
    }
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.ahd_admin_session;
    if (!token) {
      res.status(401).json({ message: "Admin authentication required" });
      return;
    }
    const admin = await getSessionAdmin(hashSessionToken(token));
    if (!admin) {
      res.clearCookie("ahd_admin_session");
      res.status(401).json({ message: "Admin session expired" });
      return;
    }
    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin || !canAdminRole(req.admin.role, roles)) {
      res.status(403).json({ message: "Insufficient admin permissions" });
      return;
    }
    next();
  };
}
