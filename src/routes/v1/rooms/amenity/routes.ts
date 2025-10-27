import { create, destroy, get, update } from "@/controllers/v1/rooms/amenity";
import { Role } from "@/enums";
import { authMiddleware, checkRoleMiddleware } from "@/middlewares";
import {
  createValidator,
  deleteValidator,
  getValidator,
  updateValidator,
} from "@/validators/v1/rooms/amenity";
import validate from "@/validators/validate";
import { Router } from "express";

const router: Router = Router();

/**
 * @route POST /api/v1/room/amenities/:slug
 * @description Create a new amenity for a specific room
 * @access Private
 */
router.post(
  "/:slug",
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN, Role.HOST]),
  createValidator(),
  validate,
  create
);

/**
 * @route GET /api/v1/room/amenities/:slug
 * @description Get all amenities for a specific room
 * @access Public
 */
router.get("/:slug", getValidator(), validate, get);

/**
 * @route DELETE /api/v1/room/amenities/:id
 * @description Delete an room amenity
 * @access Private
 */
router.delete(
  "/:id",
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN, Role.HOST]),
  deleteValidator(),
  validate,
  destroy
);

/**
 * @route PUT /api/v1/room/amenities/:id
 * @description Update a room amenity
 * @access Private
 */
router.put(
  "/:id",
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN, Role.HOST]),
  updateValidator(),
  validate,
  update
);

export default router;
