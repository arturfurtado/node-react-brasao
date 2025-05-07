import { Request, Response, NextFunction } from "express";
import * as fillSvc from "../services/fillService";

export async function createFill(req: Request, res: Response, next: NextFunction) {
  try {
    const { fieldId, value } = req.body;
    const fill = await fillSvc.createFill(fieldId, value);
    res.status(201).json(fill);
  } catch (err) {
    next(err);
  }
}

export async function getFills(req: Request, res: Response, next: NextFunction) {
  try {
    const fills = await fillSvc.listFills();
    res.json(fills);
  } catch (err) {
    next(err);
  }
}
