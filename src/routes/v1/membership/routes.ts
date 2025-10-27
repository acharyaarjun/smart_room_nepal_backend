import { Router } from "express";
import {
  createMembership,
  verifyKhaltiPayment,
  getMyPayments,
  getActiveMembership,
  getByAdmin,
  updateStatusByAdmin,
} from "@/controllers/v1/payments";
import { authMiddleware, checkRoleMiddleware } from "@/middlewares";
import {
  createMembershipValidator,
  getMyPaymentsValidator,
  getByAdminValidator,
  updateStatusByAdminValidator,
} from "@/validators/v1/membership";
import validate from "@/validators/validate";
import { Role } from "@/enums";

const router: Router = Router();

/**
 * @route POST /api/v1/membership
 * @description Create a new membership payment
 * @access Private
 */
router.post(
  "/",
  authMiddleware,
  checkRoleMiddleware([Role.HOST]),
  createMembershipValidator(),
  validate,
  createMembership
);

/**
 * @route GET /api/v1/membership/payment/verify/khalti
 * @description Verify Khalti payment callback
 * @access Public (Khalti callback)
 */
router.get("/payment/verify/khalti", verifyKhaltiPayment);

/**
 * @route GET /api/v1/membership/payments
 * @description Get payment history for the authenticated user
 * @access Private
 */
router.get(
  "/payments",
  authMiddleware,
  getMyPaymentsValidator(),
  validate,
  getMyPayments
);

/**
 * @route GET /api/v1/membership/active
 * @description Get active membership for the authenticated user
 * @access Private
 */
router.get("/active", authMiddleware, getActiveMembership);

/**
 * @route GET /api/v1/membership/admin/payments
 * @description Get all payments (admin only) with filters
 * @access Private (Admin only)
 */
router.get(
  "/admin/payments",
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN]),
  getByAdminValidator(),
  validate,
  getByAdmin
);

/**
 * @route PUT /api/v1/membership/admin/payments/:paymentId
 * @description Update payment status (admin only)
 * @access Private (Admin only)
 */
router.put(
  "/admin/payments/:paymentId",
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN]),
  updateStatusByAdminValidator(),
  validate,
  updateStatusByAdmin
);

export default router;
