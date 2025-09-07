import {
  create,
  destroy,
  getByAdmin,
  update,
} from "@/controllers/v1/admin/district";
import { FileStorageDirectory, Role } from "@/enums";
import { authMiddleware, checkRoleMiddleware } from "@/middlewares";
import { uploadImageFileMiddleware } from "@/middlewares/multer.middleware";
import {
  createValidator,
  deleteValidator,
  getByAdminValidator,
  updateValidator,
} from "@/validators/v1/admin/district";
import validate from "@/validators/validate";
import { Router } from "express";

const router: Router = Router();

/**
 * @route POST /api/v1/districts
 * @description Create a new district
 * @access Private
 */
router.post(
  "/",
  uploadImageFileMiddleware({
    directory: FileStorageDirectory.DISTRICTS,
  }).single("image"),
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN]),
  createValidator(),
  validate,
  create
);

/**
 * @route GET /api/v1/districts
 * @description Get all districts
 * @access Public
 */
router.get("/", getByAdminValidator(), validate, getByAdmin);

/**
 * @route DELETE /api/v1/districts/:id
 * @description Delete an district
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
 * @route PUT /api/v1/districts/:id
 * @description Update an district
 * @access Private
 */
router.put(
  "/:id",
  uploadImageFileMiddleware({
    directory: FileStorageDirectory.DISTRICTS,
  }).single("image"),
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN]),
  updateValidator(),
  validate,
  update
);

export default router;
