import config from 'config';
import { Message } from 'amqplib';
import { Microservice } from '@lib/microservice';
import { initPgConnection } from '@lib/server';
import { logger, dbConnection } from './config';
import { getProducts, getProductById } from './routes';
import { handleEventMessage } from './domain-events';

const { app, listen } = Microservice({
  serviceName: config.get('serviceName'),
  isProduction: process.env.NODE_ENV === 'production',
  serverCors: false,
  serverApiKey: config.get('server.apiKey'),
  serverPort: config.get<number>('server.port'),
  serverJsonLimit: config.get('server.jsonLimit'),
  brokerUrl: config.get('amqp.connection'),
  brokerExchanges: config.get<string>('amqp.exchanges').split('|'),
  brokerConsumerHandler: async (message: Message) => handleEventMessage(message),
  serverListenCb: async () => {
    await initPgConnection(dbConnection, logger);
  },
  serverExit: async () => {
    await dbConnection.close();
    logger.info('Database connection closed.');
  },
  logger,
});

app.get('/v1/products', getProducts);
app.get('/v1/products/:id', getProductById);

listen();
