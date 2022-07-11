/* eslint-disable @typescript-eslint/no-floating-promises */

import { Connection, Channel, Message } from 'amqplib';
import { ICommerceDebugger } from '@lib/common';

function stringifyMessage(message: Message | null) {
  if (!message) return '<empty>';
  const content = JSON.parse(message.content.toString()) as { [key: string]: any };
  return JSON.stringify({ ...message, content });
}

export async function startConsumer(
  connection: Connection,
  topics: string[],
  logger: ICommerceDebugger,
  messageHandler?: (message: Message) => Promise<void>,
): Promise<Channel> {
  const channel = await connection.createChannel();
  channel.on('error', err => logger.error('[AMQP][consumer] channel error', err));
  channel.on('close', () => logger.error('[AMQP][consumer] channel closed'));
  channel.prefetch(10);

  await Promise.all(topics.map(topic => channel.assertExchange(topic, 'topic', { durable: true })));

  const { queue } = await channel.assertQueue('', { exclusive: true });

  topics.forEach(topic => {
    logger.info(`[AMQP][consumer] binding queue for topic: ${topic}`);
    channel.bindQueue(queue, topic, '#');
  });

  channel.consume(
    queue,
    message => {
      logger.info('[AMQP][consumer] received message: ', stringifyMessage(message));
      if (messageHandler && message) {
        messageHandler(message);
      }
    },
    { noAck: true },
  );

  logger.info('[AMQP][consumer] started with topics:', topics.join(' | '));

  return channel;
}
