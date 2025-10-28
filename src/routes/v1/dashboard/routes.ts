import { Router } from "express";
import {
  getUserDashboard,
  getHostDashboard,
  getAdminDashboard,
} from "@/controllers/v1/dashboard";
import { authMiddleware, checkRoleMiddleware } from "@/middlewares";
import { Role } from "@/enums";

const router: Router = Router();

/**
 * @route GET /api/v1/dashboard/user
 * @description Get user dashboard data
 * @access Private (User)
 */
router.get(
  "/user",
  authMiddleware,
  checkRoleMiddleware([Role.USER]),
  getUserDashboard
);

/**
 * @route GET /api/v1/dashboard/host
 * @description Get host dashboard data
 * @access Private (Host)
 */
router.get(
  "/host",
  authMiddleware,
  checkRoleMiddleware([Role.HOST]),
  getHostDashboard
);

/**
 * @route GET /api/v1/dashboard/admin
 * @description Get admin dashboard data
 * @access Private (Admin)
 */
router.get(
  "/admin",
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN]),
  getAdminDashboard
);

export default router;
