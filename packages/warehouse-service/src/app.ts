import config from 'config';
import { Microservice } from '@lib/microservice';
import { logger, dbConnection } from './config';
import { getProducts, getProductById } from './routes';
import { defineModels } from './models';

const { app, listen } = Microservice({
  serviceName: config.get('serviceName'),
  isProduction: process.env.NODE_ENV === 'production',
  serverCors: false,
  serverApiKey: config.get('server.apiKey'),
  serverPort: config.get<number>('server.port'),
  serverJsonLimit: config.get('server.jsonLimit'),
  // eslint-disable-next-line @typescript-eslint/require-await
  serverListenCb: async () => {
    defineModels();
  },
  serverExit: async () => {
    await dbConnection.close();
    logger.info('Database connection closed.');
  },
  logger,
});

app.get('/v1/products', getProducts);
app.get('/v1/products/:id', getProductById);

export { app, listen };
