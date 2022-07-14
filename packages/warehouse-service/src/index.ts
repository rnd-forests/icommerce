import config from 'config';
import { partial } from 'ramda';
import { Message } from 'amqplib';
import { Microservice } from '@lib/microservice';
import { initPgConnection, rabbitmq } from '@lib/server';
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

const initRabbitMQ = async () => {
  const exchanges = config.get<string>('amqp.exchanges').split('|');
  const connection = await rabbitmq.connect({
    url: config.get('amqp.connection'),
    connectionName: config.get('serviceName'),
    logger,
  });
  const producerChannel = await rabbitmq.startProducer(connection, exchanges, logger);
  const consumerHandler = partial(handleEventMessage, [producerChannel]) as (message: Message) => Promise<void>;
  await rabbitmq.startConsumer({
    connection,
    topics: exchanges,
    logger,
    queueName: 'queue:warehouse:orders',
    messageHandler: consumerHandler,
  });
};

initRabbitMQ()
  .then(() => listen())
  .catch(() => {});
