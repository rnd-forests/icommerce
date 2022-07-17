import config from 'config';
import { Microservice } from '@lib/microservice';
import { initPgConnection } from '@lib/server';
import { logger, dbConnection } from './config';
import { getCustomerById, createCustomer } from './routes';
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

app.post('/v1/customers', createCustomer);
app.get('/v1/customers/:id', getCustomerById);

Promise.all([initPgConnection(dbConnection, logger)])
  .then(() => listen())
  .catch(() => {
    process.exitCode = 1;
    setTimeout(() => process.exit(1), 1000);
  });
