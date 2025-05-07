import { Request, Response, NextFunction } from "express";

export function makeCreateHandler<TArgs, TEntity>(
  createFn: (args: TArgs) => Promise<TEntity>,
  statusCode = 201
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entity = await createFn(req.body as TArgs);
      res.status(statusCode).json(entity);
    } catch (err) {
      next(err);
    }
  };
}

export function makeListHandler<TEntity>(
  listFn: () => Promise<TEntity[]>
) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await listFn();
      res.json(list);
    } catch (err) {
      next(err);
    }
  };
}
