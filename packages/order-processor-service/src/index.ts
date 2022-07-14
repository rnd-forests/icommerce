import config from 'config';
import { partial } from 'ramda';
import { Connection, Message } from 'amqplib';
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
    defineModels();
  },
  serverExit: async () => {
    await dbConnection.close();
    logger.info('Database connection closed.');
  },
  logger,
});

app.post('/v1/orders', createOrder);

const initOrderBroker = async (connection: Connection) => {
  const topics = config.get<string>('amqp.orderExchanges').split('|');
  const producer = await rabbitmq.startProducer(connection, topics, logger);
  app.set('order-producer-channel', producer);

  const consumerHandler = partial(handleEventMessage, [producer]) as (message: Message) => Promise<void>;
  await rabbitmq.startConsumer({
    connection,
    topics,
    logger,
    queueName: 'queue:order-processor:orders',
    messageHandler: consumerHandler,
  });
};

const initUserActivityBroker = async (connection: Connection) => {
  const topics = config.get<string>('amqp.userActivitiesExchanges').split('|');
  return rabbitmq.startProducer(connection, topics, logger);
};

const initRabbitMQ = async () => {
  const connection = await rabbitmq.connect({
    url: config.get('amqp.connection'),
    connectionName: config.get('serviceName'),
    logger,
  });

  await Promise.all([initOrderBroker(connection), initUserActivityBroker(connection)]);
};

Promise.all([initRabbitMQ(), initPgConnection(dbConnection, logger)])
  .then(() => listen())
  .catch(() => {
    process.exitCode = 1;
    setTimeout(() => process.exit(1), 1000);
  });
