import { toggle, get } from "@/controllers/v1/rooms/wishlist";
import { authMiddleware } from "@/middlewares";
import { toggleValidator, getValidator } from "@/validators/v1/rooms/wishlist";
import validate from "@/validators/validate";
import { Router } from "express";

const router: Router = Router();

/**
 * @route POST /api/v1/rooms/wishlist/:slug
 * @description Toggle room in wishlist (add if not exists, remove if exists)
 * @access Private
 */
router.post("/:slug", authMiddleware, toggleValidator(), validate, toggle);

/**
 * @route GET /api/v1/rooms/wishlist
 * @description Get all wishlisted rooms for the authenticated user
 * @access Private
 */
router.get("/", authMiddleware, getValidator(), validate, get);

export default router;
