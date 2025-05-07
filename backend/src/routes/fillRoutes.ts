import { Router } from "express";
import { validateBody } from "../middlewares/validateBody";
import { createFillSchema } from "../validators/fillValidator";
import * as fillCtrl from "../controllers/fillController";

const router = Router();

router.post("/", validateBody(createFillSchema), fillCtrl.createFill);
router.get("/", fillCtrl.getFills);

export default router;
