import config from 'config';
import { Microservice } from '@lib/microservice';
import { logger, dbConnection } from './config';
import { defineModels } from './models';
import { getCustomerById, createCustomer } from './routes';

const { app, listen } = Microservice({
  serviceName: config.get('serviceName'),
  isProduction: process.env.NODE_ENV === 'production',
  serverCors: false,
  jwtConfigurations: {
    publicKey: config.get('server.jwt.publicKey'),
    privateKey: config.get('server.jwt.privateKey'),
    algorithm: config.get('server.jwt.algorithm'),
    expiresIn: config.get('server.jwt.expiresIn'),
    issuer: config.get('serviceName'),
    audience: config.get('server.jwt.audience'),
    audiencePublicKeys: config.get('server.jwt.audiencePublicKeys'),
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

export { app, listen };
