import {
  create,
  getByAdmin,
  update,
  get,
  getByHost,
  getSingle,
  getSingleForUser,
} from "@/controllers/v1/rooms";
import { FileStorageDirectory, Role } from "@/enums";
import {
  authMiddleware,
  checkLimitMiddleware,
  checkRoleMiddleware,
  optionalAuthMiddleware,
} from "@/middlewares";
import { uploadImageFileMiddleware } from "@/middlewares/multer.middleware";
import {
  createValidator,
  getByAdminValidator,
  getByHostValidator,
  getSingleForUserValidator,
  getSingleValidator,
  getValidator,
  updateValidator,
} from "@/validators/v1/rooms";
import validate from "@/validators/validate";
import { Router } from "express";
import RoomAmenityRoutes from "./amenity/routes";
import RoomMediaRoutes from "./media/routes";
import RoomRequestRoutes from "./requests/routes";
import RoomReviewRoutes from "./reviews/routes";
import RecentlyViewedRoutes from "./recentlyViewed/routes";
import WishlistRoutes from "./wishlist/routes";

const router: Router = Router();
router.use("/amenities", RoomAmenityRoutes);
router.use("/medias", RoomMediaRoutes);
router.use("/requests", RoomRequestRoutes);
router.use("/reviews", RoomReviewRoutes);
router.use("/recently-viewed", RecentlyViewedRoutes);
router.use("/wishlist", WishlistRoutes);

/**
 * @route POST /api/v1/rooms
 * @description Create a new room
 * @access Private
 */
router.post(
  "/",
  uploadImageFileMiddleware({
    directory: FileStorageDirectory.ROOMS,
  }).single("image"),
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN, Role.HOST]),
  checkLimitMiddleware,
  createValidator(),
  validate,
  create
);

/**
 * @route GET /api/v1/rooms/admin
 * @description Get all rooms
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
 * @route GET /api/v1/rooms/host
 * @description Get rooms by host
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
 * @route GET /api/v1/rooms
 * @description Get all public rooms (with wishlist flag if authenticated)
 * @access Public (optional auth)
 */
router.get("/", optionalAuthMiddleware, getValidator(), validate, get);

/**
 * @route PUT /api/v1/rooms/:slug
 * @description Update an room
 * @access Private
 */
router.put(
  "/:slug",
  uploadImageFileMiddleware({
    directory: FileStorageDirectory.ROOMS,
  }).single("image"),
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN, Role.HOST]),
  updateValidator(),
  validate,
  update
);

/**
 * @route GET /api/v1/rooms/:slug
 * @description Get a single room
 * @access Private
 */
router.get(
  "/:slug",
  authMiddleware,
  authMiddleware,
  checkRoleMiddleware([Role.ADMIN, Role.HOST]),
  getSingleValidator(),
  validate,
  getSingle
);

/**
 * @route GET /api/v1/rooms/:slug/user
 * @description Get a single room for user
 * @access Public (but tracks recently viewed if authenticated)
 */
router.get(
  "/:slug/user",
  optionalAuthMiddleware,
  getSingleForUserValidator(),
  validate,
  getSingleForUser
);

export default router;
