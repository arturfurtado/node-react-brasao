import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validateBody(schema: ZodSchema<any>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          message: "Erro de validação no corpo da requisição",
          errors: err.errors,
        });
        return;
      }
      return next(err);
    }
  };
}
