import { Router } from "express";
import { validateBody } from "../middlewares/validateBody";
import {
  createFillSchema,
  updateFillSchema,
} from "../validators/fillValidator";
import * as fillCtrl from "../controllers/fillController";

const router = Router();

router.post(
  "/",
  validateBody(createFillSchema),
  fillCtrl.createFill
);
router.get("/", fillCtrl.getFills);

router.put(
  "/:id",
  validateBody(updateFillSchema),
  fillCtrl.updateFill
);

router.delete("/:id", fillCtrl.deleteFill);

export default router;
