import { get } from "@/controllers/v1/rooms/recentlyViewed";
import { authMiddleware } from "@/middlewares";
import { getValidator } from "@/validators/v1/rooms/recentlyViewed";
import validate from "@/validators/validate";
import { Router } from "express";

const router: Router = Router();

/**
 * @route GET /api/v1/rooms/recently-viewed
 * @description Get all recently viewed rooms for the authenticated user
 * @access Private
 */
router.get("/", authMiddleware, getValidator(), validate, get);

export default router;
