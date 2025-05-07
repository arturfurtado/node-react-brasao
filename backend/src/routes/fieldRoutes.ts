import { Router } from "express";
import { validateBody } from "../middlewares/validateBody";
import { createFieldSchema } from "../validators/fieldValidator";
import * as fieldCtrl from "../controllers/fieldController";

const router = Router();

router.post("/", validateBody(createFieldSchema), fieldCtrl.createField);
router.get("/", fieldCtrl.getFields);

export default router;
