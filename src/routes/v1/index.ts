import { Router } from "express";
import AuthRoute from "./auth/routes";
import AmenityRoute from "./amenity/routes";
import DistrictRoute from "./district/routes";
import MembershipTypeRoute from "./membershipTypes/routes";
import MembershipRoute from "./membership/routes";
import RoomRoute from "./rooms/routes";
import UserRoute from "./users/routes";
import DashboardRoute from "./dashboard/routes";

const router: Router = Router();

router.use("/auth", AuthRoute);
router.use("/amenities", AmenityRoute);
router.use("/districts", DistrictRoute);
router.use("/membership-types", MembershipTypeRoute);
router.use("/membership", MembershipRoute);
router.use("/rooms", RoomRoute);
router.use("/users", UserRoute);
router.use("/dashboard", DashboardRoute);

export default router;
