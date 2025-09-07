import {
  loginValidator,
  logoutValidator,
  registerValidator,
} from "@/validators/v1/auth";
import { Router } from "express";
import validate from "@/validators/validate";
import { login, logout, register } from "@/controllers/v1/auth";
import { authMiddleware } from "@/middlewares";
import { uploadImageFileMiddleware } from "@/middlewares/multer.middleware";
import { FileStorageDirectory } from "@/enums";

const router: Router = Router();
/**
 * @route POST /api/v1/auth/login
 * @description Login
 * @access Public
 */
router.post("/login", loginValidator(), validate, login);

/**
 * @route POST /api/v1/auth/register
 * @description Register a new user
 * @access Public
 */
router.post(
  "/register",
  uploadImageFileMiddleware({
    directory: FileStorageDirectory.DOCUMENTS,
  }).single("document"),
  registerValidator(),
  validate,
  register
);

/**
 * @route POST /api/v1/auth/logout
 * @description Logout
 * @access Private
 */
router.post("/logout", authMiddleware, logoutValidator(), validate, logout);

export default router;
