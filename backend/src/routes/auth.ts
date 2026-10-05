import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../middleware/auth";
import { authenticate } from "../middleware/auth";
import { authService } from "../services/authService";
import { validate, loginSchema } from "../validators";
import { config } from "../config";

const router = Router();

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many login attempts. Try again later." } },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = validate(loginSchema, req.body);
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  })
);

// POST /api/auth/logout
router.post(
  "/logout",
  asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body?.refreshToken as string | undefined;
    await authService.logout(refreshToken);
    res.json({ success: true, data: { message: "Logged out" } });
  })
);

// GET /api/auth/me
router.get(
  "/me",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const admin = await authService.getMe(req.admin!.adminId);
    res.json({ success: true, data: admin });
  })
);

// POST /api/auth/refresh
router.post(
  "/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) {
      res.status(400).json({ success: false, error: { code: "MISSING_TOKEN", message: "Refresh token required" } });
      return;
    }
    const result = await authService.refresh(refreshToken);
    res.json({ success: true, data: result });
  })
);

export default router;
