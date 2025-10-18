import {
  create,
  update,
  get,
  getByHost,
  getByAdmin,
} from "@/controllers/v1/rooms/requests";
import { Role } from "@/enums";
import { authMiddleware, checkRoleMiddleware } from "@/middlewares";
import {
  createValidator,
  updateValidator,
  getValidator,
  getByHostValidator,
  getByAdminValidator,
} from "@/validators/v1/rooms/requests";
import validate from "@/validators/validate";
import { Router } from "express";
import ConversationRoutes from "./conversations/routes";

const router: Router = Router();

// Mount conversation routes
router.use("/:roomRequestId/conversations", ConversationRoutes);

/**
 * @route POST /api/v1/room/requests/:slug
 * @description Create a new request for a specific room
 * @access Private
 */
router.post(
  "/:slug",
  authMiddleware,
  checkRoleMiddleware([Role.USER]),
  createValidator(),
  validate,
  create
);

/**
 * @route PUT /api/v1/room/requests/:token
 * @description Update a specific request for a room
 * @access Private
 */
router.put("/:token", authMiddleware, updateValidator(), validate, update);

/**
 * @route GET /api/v1/room/requests
 * @description Get details of a specific room request
 * @access Private
 */
router.get("/", authMiddleware, getValidator(), validate, get);

/**
 * @route GET /api/v1/room/requests/host
 * @description Get all room requests for rooms owned by the host
 * @access Private
 */
router.get(
  "/host",
  authMiddleware,
  checkRoleMiddleware([Role.HOST]),
  getByHostValidator(),
  validate,
  getByHost
);

/**
 * @route GET /api/v1/room/requests/admin
 * @description Get all room requests (admin only)
 * @access Private
 */
router.get(
  "/admin",
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN]),
  getByAdminValidator(),
  validate,
  getByAdmin
);

export default router;
