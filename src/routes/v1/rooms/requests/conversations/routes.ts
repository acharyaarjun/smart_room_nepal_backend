import { Router } from "express";
import { authMiddleware } from "@/middlewares";
import getConversations from "@/controllers/v1/rooms/requests/conversations/get.controller";
import { param } from "express-validator";
import validate from "@/validators/validate";

const router: Router = Router();

/**
 * @route GET /api/v1/room/requests/:roomRequestId/conversations
 * @description Get conversation history for a room request
 * @access Private
 */

export default router;
