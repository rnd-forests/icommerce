import config from 'config';
import { Microservice } from '@lib/microservice';
import { rabbitmq } from '@lib/server';
import { logger } from './config';
import { handleEventMessage } from './domain-events';
import { Mongo } from './config/mongo';

const { listen } = Microservice({
  serviceName: config.get('serviceName'),
  isProduction: process.env.NODE_ENV === 'production',
  serverCors: false,
  serverApiKey: config.get('server.apiKey'),
  serverPort: config.get<number>('server.port'),
  serverJsonLimit: config.get('server.jsonLimit'),
  serverListenCb: async () => {},
  serverExit: async () => {
    Mongo.client.close(mongoError => {
      if (mongoError) {
        logger.error('[MONGO] failed to close connection');
      } else {
        logger.info('[MONGO] connection closed');
        process.exit(0);
      }
    });
  },
  logger,
});

const initRabbitMQ = async () => {
  const exchanges = config.get<string>('amqp.exchanges').split('|');
  const connection = await rabbitmq.connect({
    url: config.get('amqp.connection'),
    connectionName: config.get('serviceName'),
    logger,
  });
  await rabbitmq.startConsumersForGivenQueue(3, {
    connection,
    topics: exchanges,
    logger,
    queueName: 'queue:activity-log:user:activities',
    messageHandler: handleEventMessage,
  });
};

Promise.all([initRabbitMQ(), Mongo.waitReady()])
  .then(() => listen())
  .catch(() => {
    process.exitCode = 1;
    setTimeout(() => process.exit(1), 1000);
  });
