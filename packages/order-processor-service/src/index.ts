import config from 'config';
import { partial } from 'ramda';
import { Connection, Message } from 'amqplib';
import { initPgConnection, rabbitmq } from '@lib/server';
import { logger, dbConnection } from './config';
import { handleEventMessage } from './domain-events';

import { app, listen } from './app';

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
  const producer = await rabbitmq.startProducer(connection, topics, logger);
  app.set('user-activity-producer-channel', producer);
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
