import { create, destroy, get } from "@/controllers/v1/rooms/media";
import { FileStorageDirectory, Role } from "@/enums";
import { authMiddleware, checkRoleMiddleware } from "@/middlewares";
import { uploadFileMiddleware } from "@/middlewares/multer.middleware";
import {
  createValidator,
  deleteValidator,
  getValidator,
} from "@/validators/v1/rooms/media";
import validate from "@/validators/validate";
import { Router } from "express";

const router: Router = Router();

/**
 * @route POST /api/v1/room/medias/:slug
 * @description Create a new amenity for a specific room
 * @access Private
 */
router.post(
  "/:slug",
  uploadFileMiddleware({
    directory: FileStorageDirectory.ROOMS,
  }).array("medias"),
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN, Role.HOST]),
  createValidator(),
  validate,
  create
);

/**
 * @route GET /api/v1/room/medias/:slug
 * @description Get all amenities for a specific room
 * @access Public
 */
router.get("/:slug", authMiddleware, getValidator(), validate, get);

/**
 * @route DELETE /api/v1/room/medias/:id
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

export default router;
