import {
  create,
  update,
  deleteReview,
  get,
  getByAdmin,
  getByHost,
  getByUser,
  getByRoomRequest,
} from "@/controllers/v1/rooms/reviews";
import { Role } from "@/enums";
import { authMiddleware, checkRoleMiddleware } from "@/middlewares";
import {
  createValidator,
  updateValidator,
  deleteValidator,
  getValidator,
  getByAdminValidator,
  getByHostValidator,
  getByUserValidator,
  getByRoomRequestValidator,
} from "@/validators/v1/rooms/reviews";
import validate from "@/validators/validate";
import { Router } from "express";

const router: Router = Router();

/**
 * @route POST /api/v1/rooms/reviews/:roomRequestId
 * @description Create a review for a completed room request
 * @access Private (USER)
 */
router.post(
  "/:roomRequestId",
  authMiddleware,
  checkRoleMiddleware([Role.USER]),
  createValidator(),
  validate,
  create
);

/**
 * @route GET /api/v1/rooms/reviews/user
 * @description Get all reviews made by the logged-in user
 * @access Private (USER)
 */
router.get(
  "/user",
  authMiddleware,
  checkRoleMiddleware([Role.USER]),
  getByUserValidator(),
  validate,
  getByUser
);

/**
 * @route GET /api/v1/rooms/reviews/host
 * @description Get all reviews for rooms owned by the logged-in host
 * @access Private (HOST)
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
 * @route GET /api/v1/rooms/reviews/admin
 * @description Get all reviews (admin only)
 * @access Private (ADMIN)
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
 * @route GET /api/v1/rooms/reviews/room-request/:roomRequestId
 * @description Get review for a specific room request
 * @access Public
 */
router.get(
  "/room-request/:roomRequestId",
  getByRoomRequestValidator(),
  validate,
  getByRoomRequest
);

/**
 * @route GET /api/v1/rooms/reviews
 * @description Get all public reviews
 * @access Public
 */
router.get("/", getValidator(), validate, get);

/**
 * @route PUT /api/v1/rooms/reviews/:reviewId
 * @description Update a review
 * @access Private (USER - owner of review)
 */
router.put(
  "/:reviewId",
  authMiddleware,
  checkRoleMiddleware([Role.USER]),
  updateValidator(),
  validate,
  update
);

/**
 * @route DELETE /api/v1/rooms/reviews/:reviewId
 * @description Delete a review
 * @access Private (USER - owner of review)
 */
router.delete(
  "/:reviewId",
  authMiddleware,
  checkRoleMiddleware([Role.USER]),
  deleteValidator(),
  validate,
  deleteReview
);

export default router;
