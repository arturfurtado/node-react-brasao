import { Router } from "express";
import { validateBody } from "../middlewares/validateBody";
import {
  createFieldSchema,
  updateFieldSchema,
} from "../validators/fieldValidator";
import * as fieldCtrl from "../controllers/fieldController";

const router = Router();

router.post(
  "/",
  validateBody(createFieldSchema),
  fieldCtrl.createField
);
router.get("/", fieldCtrl.getFields);

router.put(
  "/:id",
  validateBody(updateFieldSchema),
  fieldCtrl.updateField
);

router.delete("/:id", fieldCtrl.deleteField);

export default router;
