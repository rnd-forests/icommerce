/* eslint-disable @typescript-eslint/no-floating-promises */

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'http';
import express from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bodyParser from 'body-parser';
import { ICommerceDebugger } from '@lib/common';
import _isError from 'lodash/isError';

interface MicroserviceInitOptions {
  serviceName: string;
  isProduction: boolean;
  serverCors: boolean;
  serverPort: number;
  serverApiKey?: string;
  serverListenCb: () => Promise<void>;
  serverExit: () => Promise<void>;
  serverJsonLimit: string;
  logger: ICommerceDebugger;
  jwtConfigurations?: {
    secret: string;
    expiresIn: string | number;
    issuer: string;
    audience: string[]; // The list of microservices that this microservice communicates with.
    ignoredPaths: string[];
  };
}

export function Microservice(opts: MicroserviceInitOptions) {
  const {
    serviceName,
    isProduction,
    serverCors,
    serverPort,
    serverApiKey,
    serverJsonLimit,
    serverListenCb,
    serverExit,
    logger,
    jwtConfigurations,
  } = opts;

  logger.info(`[SERVER] initializing microservice: ${serviceName}`);

  const app = express();
  const server = new Server(app);

  function exit(e: any) {
    if (_isError(e)) {
      logger.error(e);
    }

    logger.info('[SERVER] server process exiting...');

    const exitCode = _isError(e) ? 1 : 0;

    server.close((serverError: any) => {
      if (serverError) {
        logger.error(serverError, '[SERVER] server error');
      }
      serverExit()
        .then(() => process.exit(exitCode))
        .catch(() => {
          process.exit(exitCode);
        });
    });
  }
  process.on('uncaughtException', exit);
  process.on('SIGTERM', exit);
  process.on('SIGINT', exit);

  if (isProduction) {
    app.enable('trust proxy');
  }

  if (serverCors) {
    // @ts-ignore
    app.options('*', cors({ credentials: true }));
  }

  const authorizationErrMessage = 'Invalid authorization credential provided.';

  /**
   * This is a basic server to server authentication using API key.
   */
  if (serverApiKey) {
    app.use((req, res, next) => {
      const token = req.get('Authorization-ApiKey');
      if (token !== serverApiKey) {
        res.status(401).send({ message: authorizationErrMessage });
      } else {
        next();
      }
    });
  }

  /**
   * Server to server authentication using JWT token.
   */
  if (jwtConfigurations) {
    app.use((req, res, next) => {
      if (jwtConfigurations.ignoredPaths.includes(req.path)) {
        next();
        return;
      }

      const jwtToken = req.get('Authorization-Server') || '';
      try {
        const decoded = jwt.verify(jwtToken, jwtConfigurations.secret, { complete: true });
        const { aud } = decoded.payload as JwtPayload;
        if (!aud) {
          res.status(401).send({ message: authorizationErrMessage });
          return;
        }

        const parsedAudience = typeof aud === 'string' ? [aud] : aud;
        const isValidAudience = parsedAudience.includes(serviceName);
        if (!isValidAudience) {
          res.status(401).send({ message: authorizationErrMessage });
          return;
        }
        next();
      } catch (e) {
        res.status(401).send({ message: authorizationErrMessage });
      }
    });

    app.use((_req, _res, next) => {
      const jwtToken = jwt.sign({}, jwtConfigurations.secret, {
        audience: jwtConfigurations.audience,
        expiresIn: jwtConfigurations.expiresIn,
        issuer: jwtConfigurations.issuer,
      });
      app.set('Authorization-Server', jwtToken);
      next();
    });
  }

  app.use(helmet());
  app.get('/ping', (_req, res) => res.send('ok'));
  app.use(bodyParser.json({ limit: serverJsonLimit }));
  app.use(
    morgan('tiny', {
      stream: {
        write: str => logger.info(str.replace(/(\r\n\t|\n|\r\t)/gm, '')),
      },
    }),
  );

  function listen() {
    app.listen(serverPort, () => {
      logger.info(
        `[SERVER] server listening | port: ${serverPort} | env: ${isProduction ? 'production' : 'development'}`,
      );
      serverListenCb();

      if (process && process.send) {
        process.send('ready');
      }
    });
  }

  return { listen, app, server };
}
