import {
  create,
  destroy,
  getByAdmin,
  update,
} from "@/controllers/v1/admin/membershipTypes";
import { Role } from "@/enums";
import { authMiddleware, checkRoleMiddleware } from "@/middlewares";
import {
  createValidator,
  deleteValidator,
  getByAdminValidator,
  updateValidator,
} from "@/validators/v1/admin/membershipTypes";
import validate from "@/validators/validate";
import { Router } from "express";

const router: Router = Router();

/**
 * @route POST /api/v1/membership-types
 * @description Create a new membershipType
 * @access Private
 */
router.post(
  "/",
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN]),
  createValidator(),
  validate,
  create
);

/**
 * @route GET /api/v1/membership-types
 * @description Get all membershipsTypes
 * @access Public
 */
router.get(
  "/",
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN, Role.HOST]),
  getByAdminValidator(),
  validate,
  getByAdmin
);

/**
 * @route DELETE /api/v1/membership-types/:id
 * @description Delete an membershipType
 * @access Private
 */
router.delete(
  "/:id",
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN]),
  deleteValidator(),
  validate,
  destroy
);

/**
 * @route PUT /api/v1/membership-types/:id
 * @description Update an membershipType
 * @access Private
 */
router.put(
  "/:id",
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN]),
  updateValidator(),
  validate,
  update
);

export default router;
