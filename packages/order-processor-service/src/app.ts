import config from 'config';
import { Microservice } from '@lib/microservice';
import { logger, dbConnection } from './config';
import { createOrder } from './routes';
import { defineModels } from './models';

const { app, listen } = Microservice({
  serviceName: config.get('serviceName'),
  isProduction: process.env.NODE_ENV === 'production',
  serverCors: false,
  jwtConfigurations: {
    secret: config.get('server.jwt.secret'),
    expiresIn: config.get('server.jwt.expiresIn'),
    issuer: config.get('serviceName'),
    audience: config.get('server.jwt.audience'),
    ignoredPaths: config.get('server.jwt.ignoredPaths'),
  },
  serverPort: config.get<number>('server.port'),
  serverJsonLimit: config.get('server.jsonLimit'),
  serverListenCb: async () => {
    defineModels();
  },
  serverExit: async () => {
    await dbConnection.close();
    logger.info('Database connection closed.');
  },
  logger,
});

app.post('/v1/orders', createOrder);

export { app, listen };
