import { Router } from "express";
import { authMiddleware } from "@/middlewares";
import {
  get,
  getUnreadCount,
  getUnreadSummary,
} from "@/controllers/v1/rooms/requests/conversations";
import validate from "@/validators/validate";
import {
  getConversationsValidator,
  getUnreadCountValidator,
  getUnreadSummaryValidator,
} from "@/validators/v1/rooms/requests/conversations";

const router: Router = Router({ mergeParams: true });

/**
 * @route GET /api/v1/rooms/requests/:roomRequestId/conversations
 * @description Get conversation history for a room request
 * @access Private (User and Room Owner only)
 */
router.get("/", authMiddleware, getConversationsValidator(), validate, get);

/**
 * @route GET /api/v1/rooms/requests/:roomRequestId/conversations/unread-count
 * @description Get unread messages count for a room request
 * @access Private (User and Room Owner only)
 */
router.get(
  "/unread-count",
  authMiddleware,
  getUnreadCountValidator(),
  validate,
  getUnreadCount
);

/**
 * @route GET /api/v1/rooms/requests/conversations/unread-summary
 * @description Get all room requests with unread message counts for current user
 * @access Private
 */
router.get(
  "/summary",
  authMiddleware,
  getUnreadSummaryValidator(),
  validate,
  getUnreadSummary
);

export default router;
