import { ValidationException } from '../exceptions/validateException'; 
import { NextFunction, Request, Response } from 'express';

export function errorMiddleware(error: Error, req: Request, res: Response, _next: NextFunction) {
  console.log(error)
  if (error instanceof ValidationException) {
    res.status(400).send({ message: error.message });
    return;
  }

  res.status(500).send({ message: 'Internal server error' });
}