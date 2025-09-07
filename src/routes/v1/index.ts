import { Router } from "express";
import AuthRoute from "./auth/routes";
import AmenityRoute from "./amenity/routes";
import DistrictRoute from "./district/routes";

const router: Router = Router();

router.use("/auth", AuthRoute);
router.use("/amenities", AmenityRoute);
router.use("/districts", DistrictRoute);
export default router;
