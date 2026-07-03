import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import trademarksRouter from "./trademarks.js";
import dashboardRouter from "./dashboard.js";
import authRouter from "./auth.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(requireAuth, trademarksRouter);
router.use(requireAuth, dashboardRouter);

export default router;
