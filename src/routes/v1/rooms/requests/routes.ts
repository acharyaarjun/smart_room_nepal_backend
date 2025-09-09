import {
  create,
  update,
  get,
  getByHost,
  getByAdmin,
  getSingle,
  getSingleByHost,
} from "@/controllers/v1/rooms/requests";
import { Role } from "@/enums";
import { authMiddleware, checkRoleMiddleware } from "@/middlewares";
import {
  createValidator,
  updateValidator,
  getValidator,
  getByHostValidator,
  getByAdminValidator,
  getSingleValidator,
  getSingleByHostValidator,
} from "@/validators/v1/rooms/requests";
import validate from "@/validators/validate";
import { Router } from "express";

const router: Router = Router();

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
 * @route GET /api/v1/room/requests/:token
 * @description Get details of a specific room request
 * @access Private
 */
router.get("/:token", authMiddleware, getValidator(), validate, get);

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

/**
 * @route GET /api/v1/room/requests/single/:token
 * @description Get details of a specific room request (admin only)
 * @access Private
 */
router.get(
  "/single/:token",
  authMiddleware,
  checkRoleMiddleware([Role.USER]),
  getSingleValidator(),
  validate,
  getSingle
);
/**
 * @route GET /api/v1/room/requests/host/single/:token
 * @description Get details of a specific room request for rooms owned by the host
 * @access Private
 */
router.get(
  "/host/single/:token",
  authMiddleware,
  checkRoleMiddleware([Role.HOST]),
  getSingleByHostValidator(),
  validate,
  getSingleByHost
);

export default router;
