/* eslint-disable @typescript-eslint/no-floating-promises */

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import { Message } from 'amqplib';
import { ICommerceDebugger } from '@lib/common';
import { rabbitmq } from '@lib/server';
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
  brokerUrl?: string;
  brokerExchanges?: string[];
  brokerConsumerHandler?: (message: Message) => Promise<void>;
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
    brokerUrl,
    brokerExchanges,
    brokerConsumerHandler,
    serverListenCb,
    serverExit,
    logger,
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

  /**
   * This is a basic server to server authentication using API key.
   */
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

      if (brokerUrl && brokerExchanges) {
        rabbitmq.connect(brokerUrl, logger).then(conn => {
          rabbitmq.startProducer(conn, brokerExchanges, logger).then(channel => app.set('producer-channel', channel));
          rabbitmq.startConsumer(conn, brokerExchanges, logger, brokerConsumerHandler);
        });
      }

      if (process && process.send) {
        process.send('ready');
      }
    });
  }

  return { listen, app, server };
}
