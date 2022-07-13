import config from 'config';
import { Microservice } from '@lib/microservice';
import { rabbitmq } from '@lib/server';
import { logger } from './config';
import { handleEventMessage } from './domain-events';

const { listen } = Microservice({
  serviceName: config.get('serviceName'),
  isProduction: process.env.NODE_ENV === 'production',
  serverCors: false,
  serverApiKey: config.get('server.apiKey'),
  serverPort: config.get<number>('server.port'),
  serverJsonLimit: config.get('server.jsonLimit'),
  serverListenCb: async () => {
    //
  },
  serverExit: async () => {
    // await dbConnection.close();
    // logger.info('Database connection closed.');
  },
  logger,
});

const initRabbitMQ = async () => {
  const exchanges = config.get<string>('amqp.exchanges').split('|');
  const connection = await rabbitmq.connect(config.get('amqp.connection'), logger);
  await rabbitmq.startConsumer(connection, exchanges, logger, handleEventMessage);
};

initRabbitMQ()
  .then(() => listen())
  .catch(() => {});
