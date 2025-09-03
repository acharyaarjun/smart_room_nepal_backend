import { Router } from "express";
import AuthRoute from "./auth/routes";

const router: Router = Router();

router.use("/auth", AuthRoute);
export default router;
