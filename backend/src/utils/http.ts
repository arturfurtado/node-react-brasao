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

export function makeUpdateHandler<TBody, TEntity>(
  updateFn: (id: string, args: TBody) => Promise<TEntity>,
  statusCode = 200
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await updateFn(
        req.params.id,
        req.body as TBody
      );
      res.status(statusCode).json(updated);
    } catch (err) {
      next(err);
    }
  };
}

export function makeDeleteHandler(
  deleteFn: (id: string) => Promise<void>,
  statusCode = 204
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteFn(req.params.id);
      res.status(statusCode).send();
    } catch (err) {
      next(err);
    }
  };
}
