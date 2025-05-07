import { Request, Response, NextFunction } from "express";
import * as fieldSvc from "../services/fieldServices";

export async function createField(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, datatype } = req.body;
    const field = await fieldSvc.createField(name, datatype);
    res.status(201).json(field);
  } catch (err) {
    next(err);
  }
}

export async function getFields(req: Request, res: Response, next: NextFunction) {
  try {
    const fields = await fieldSvc.listFields();
    res.json(fields);
  } catch (err) {
    next(err);
  }
}
