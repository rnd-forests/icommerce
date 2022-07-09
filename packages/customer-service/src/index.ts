import { Microservice } from '@lib/microservice';
import { initPgConnection } from '@lib/server';
import { SERVICE_NAME, logger, dbConnection } from './config';
import { getCustomerById, createCustomer } from './routes';

const { app, listen } = Microservice({
  serviceName: SERVICE_NAME,
  isProduction: process.env.NODE_ENV === 'production',
  serverCors: false,
  serverApiKey: process.env.SERVER_API_KEY || '',
  serverPort: parseInt(process.env.PORT || '3003', 10),
  serverJsonLimit: process.env.SERVER_JSON_LIMIT || '5mb',
  serverListenCb: async () => {
    await initPgConnection(dbConnection, logger);
  },
  serverExit: async () => {
    await dbConnection.close();
    logger.info('Database connection closed.');
  },
  logger,
});

app.post('/v1/customers', createCustomer);
app.get('/v1/customers/:id', getCustomerById);

listen();
