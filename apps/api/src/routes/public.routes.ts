import { Router } from "express";
import * as ctrl from "../controllers/public.controller.ts";

const router = Router();

router.get("/pages", ctrl.getPage);
router.get("/navigation", ctrl.navigation);

export default router;
