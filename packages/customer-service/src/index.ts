import config from 'config';
import { Microservice } from '@lib/microservice';
import { initPgConnection } from '@lib/server';
import { logger, dbConnection } from './config';
import { getCustomerById, createCustomer } from './routes';

const { app, listen } = Microservice({
  serviceName: config.get('serviceName'),
  isProduction: process.env.NODE_ENV === 'production',
  serverCors: false,
  serverApiKey: config.get('server.apiKey'),
  serverPort: config.get<number>('server.port'),
  serverJsonLimit: config.get('server.jsonLimit'),
  serverListenCb: async () => {},
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
