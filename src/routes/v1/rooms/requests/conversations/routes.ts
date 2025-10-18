import { Router } from "express";
import { authMiddleware } from "@/middlewares";
import {
  getRoomRequestConversations,
  getUnreadCount,
  getUnreadSummary,
} from "@/controllers/v1/rooms/requests/conversations/get.controller";
import { param } from "express-validator";
import validate from "@/validators/validate";

const router: Router = Router({ mergeParams: true });

/**
 * @route GET /api/v1/rooms/requests/:roomRequestId/conversations
 * @description Get conversation history for a room request
 * @access Private (User and Room Owner only)
 */
router.get(
  "/",
  authMiddleware,
  param("roomRequestId")
    .isInt()
    .withMessage("Room request ID must be an integer"),
  validate,
  getRoomRequestConversations
);

/**
 * @route GET /api/v1/rooms/requests/:roomRequestId/conversations/unread-count
 * @description Get unread messages count for a room request
 * @access Private (User and Room Owner only)
 */
router.get(
  "/unread-count",
  authMiddleware,
  param("roomRequestId")
    .isInt()
    .withMessage("Room request ID must be an integer"),
  validate,
  getUnreadCount
);

/**
 * @route GET /api/v1/rooms/requests/conversations/unread-summary
 * @description Get all room requests with unread message counts for current user
 * @access Private
 */
router.get("/summary", authMiddleware, getUnreadSummary);

export default router;
