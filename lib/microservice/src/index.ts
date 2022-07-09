import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'http';
import express from 'express';
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
  } = opts;

  logger.info(`INITIALIZING MICROSERVICE: ${serviceName}`);

  const app = express();
  const server = new Server(app);

  function exit(e: any) {
    if (_isError(e)) {
      logger.error(e);
    }

    logger.info('SERVER PROCESS EXITING...');

    const exitCode = _isError(e) ? 1 : 0;

    server.close((serverError: any) => {
      if (serverError) {
        logger.error(serverError, 'SERVER ERROR');
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

  app.use(helmet());

  app.get('/ping', (_req, res) => res.send('ok'));

  if (serverApiKey) {
    app.use((req, res, next) => {
      const token = req.get('Authorization-Server');
      if (token !== serverApiKey) {
        res.status(401).send({ message: 'Invalid authorization credential provided.' });
      } else {
        next();
      }
    });
  }

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
      logger.info(`SERVER LISTENING | PORT: ${serverPort} | ENV: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
      serverListenCb();
      if (process && process.send) {
        process.send('ready');
      }
    });
  }

  return { listen, app, server };
}
