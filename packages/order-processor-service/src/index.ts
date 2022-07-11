import { Message } from 'amqplib';
import { Microservice } from '@lib/microservice';
import { initPgConnection } from '@lib/server';
import { SERVICE_NAME, logger, dbConnection } from './config';
import { createOrder } from './routes';
import { handleEventMessage } from './domain-events';
import { defineModels } from './models';

const { app, listen } = Microservice({
  serviceName: SERVICE_NAME,
  isProduction: process.env.NODE_ENV === 'production',
  serverCors: false,
  serverApiKey: process.env.SERVER_API_KEY || '',
  serverPort: parseInt(process.env.PORT || '3002', 10),
  serverJsonLimit: process.env.SERVER_JSON_LIMIT || '5mb',
  brokerUrl: process.env.AMQP_CONNECTION,
  brokerExchanges: process.env.AMQP_EXCHANGES?.split('|'),
  brokerConsumerHandler: async (message: Message) => handleEventMessage(message),
  serverListenCb: async () => {
    await initPgConnection(dbConnection, logger);
    defineModels();
  },
  serverExit: async () => {
    await dbConnection.close();
    logger.info('Database connection closed.');
  },
  logger,
});

app.post('/v1/orders', createOrder);

listen();
