import { NextFunction, Request, Response, RequestHandler } from 'express';
import { logger } from '@lib/common';

export const middlewareDummy: RequestHandler = (_req, _res, next) => next();

export const middlewareLogRequests: RequestHandler = (req, _res, next) => {
  logger.info(req.ip, req.url, req.hostname);
  next();
};

export const middlewareAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => any) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
