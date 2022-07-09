/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { NextFunction, Request, Response, RequestHandler, ErrorRequestHandler } from 'express';
import { logger } from '@lib/common';

export const middlewareDummy: RequestHandler = (_req, _res, next) => next();

export const middlewareLogRequests: RequestHandler = (req, _res, next) => {
  logger.info(req.ip, req.url, req.hostname);
  next();
};

export const middlewareErrorLog: ErrorRequestHandler = (err, req, res) => {
  const { hostname, method, path, protocol } = req;
  logger.error(`ERROR: ${method} ${protocol}://${hostname}${path} - ${err}`);
  res.status(500).send({ message: err.message || 'Internal server error' });
};

export const middlewareAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => any) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
