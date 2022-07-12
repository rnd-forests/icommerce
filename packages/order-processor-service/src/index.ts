import config from 'config';
import { partial } from 'ramda';
import { Message } from 'amqplib';
import { Microservice } from '@lib/microservice';
import { initPgConnection, rabbitmq } from '@lib/server';
import { logger, dbConnection } from './config';
import { createOrder } from './routes';
import { handleEventMessage } from './domain-events';
import { defineModels } from './models';

const { app, listen } = Microservice({
  serviceName: config.get('serviceName'),
  isProduction: process.env.NODE_ENV === 'production',
  serverCors: false,
  serverApiKey: config.get('server.apiKey'),
  serverPort: config.get<number>('server.port'),
  serverJsonLimit: config.get('server.jsonLimit'),
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

const initRabbitMQ = async () => {
  const exchanges = config.get<string>('amqp.exchanges').split('|');
  const connection = await rabbitmq.connect(config.get('amqp.connection'), logger);
  const producerChannel = await rabbitmq.startProducer(connection, exchanges, logger);
  app.set('producer-channel', producerChannel);
  const consumerHandler = partial(handleEventMessage, [producerChannel]) as (message: Message) => Promise<void>;
  await rabbitmq.startConsumer(connection, exchanges, logger, consumerHandler);
};

initRabbitMQ()
  .then(() => listen())
  .catch(() => {});
