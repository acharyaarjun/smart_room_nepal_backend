import { Router } from "express";
import AuthRoute from "./auth/routes";
import AmenityRoute from "./amenity/routes";

const router: Router = Router();

router.use("/auth", AuthRoute);
router.use("/amenities", AmenityRoute);
export default router;
