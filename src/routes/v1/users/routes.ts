import { Router } from "express";
import {
  getByAdmin,
  updateByAdmin,
  getProfile,
  updateProfile,
} from "@/controllers/v1/users";
import { authMiddleware, checkRoleMiddleware } from "@/middlewares";
import {
  getByAdminValidator,
  updateByAdminValidator,
  updateProfileValidator,
} from "@/validators/v1/users";
import validate from "@/validators/validate";
import { FileStorageDirectory, Role } from "@/enums";
import {
  uploadImageFileMiddleware,
  uploadFileMiddleware,
} from "@/middlewares/multer.middleware";

const router: Router = Router();

/**
 * @route GET /api/v1/users
 * @description Get all users (Admin only)
 * @access Private (Admin)
 */
router.get(
  "/",
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN]),
  getByAdminValidator(),
  validate,
  getByAdmin
);

/**
 * @route PUT /api/v1/users/:userId
 * @description Update user by admin
 * @access Private (Admin)
 */
router.put(
  "/:userId",
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN]),
  updateByAdminValidator(),
  validate,
  updateByAdmin
);

/**
 * @route GET /api/v1/users/profile
 * @description Get current user's profile
 * @access Private
 */
router.get("/profile/me", authMiddleware, getProfile);

/**
 * @route PUT /api/v1/users/profile
 * @description Update current user's profile (supports avatar and document upload)
 * @access Private
 */
router.put(
  "/profile/me",
  uploadFileMiddleware({
    directory: FileStorageDirectory.DOCUMENTS, // Temporary upload location
    sizeInMb: 10,
  }).any(),
  authMiddleware,
  updateProfileValidator(),
  validate,
  updateProfile
);

export default router;
