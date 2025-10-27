import {
  create,
  destroy,
  getByAdmin,
  update,
} from "@/controllers/v1/admin/amenity";
import { Role } from "@/enums";
import { authMiddleware, checkRoleMiddleware } from "@/middlewares";
import {
  createValidator,
  deleteValidator,
  getByAdminValidator,
  updateValidator,
} from "@/validators/v1/admin/amenity";
import validate from "@/validators/validate";
import { Router } from "express";

const router: Router = Router();

/**
 * @route POST /api/v1/amenities
 * @description Create a new amenity
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
 * @route GET /api/v1/amenities
 * @description Get all amenities
 * @access Public
 */
router.get("/", getByAdminValidator(), validate, getByAdmin);

/**
 * @route DELETE /api/v1/amenities/:id
 * @description Delete an amenity
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
 * @route PUT /api/v1/amenities/:id
 * @description Update an amenity
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
