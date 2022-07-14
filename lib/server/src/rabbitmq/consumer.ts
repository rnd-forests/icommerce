/* eslint-disable @typescript-eslint/no-floating-promises */

import { Connection, Channel, Message } from 'amqplib';
import { ICommerceDebugger } from '@lib/common';

function stringifyMessage(message: Message | null) {
  if (!message) return '<empty>';
  const content = JSON.parse(message.content.toString()) as { [key: string]: any };
  return JSON.stringify({ ...message, content });
}

interface ConsumerConfig {
  connection: Connection;
  topics: string[];
  logger: ICommerceDebugger;
  queueName?: string;
  prefetch?: number;
  messageHandler?: (message: Message) => Promise<void>;
}

export async function startConsumer({
  connection,
  topics,
  logger,
  queueName,
  prefetch,
  messageHandler,
}: ConsumerConfig): Promise<Channel> {
  const channel = await connection.createChannel();
  channel.on('error', err => logger.error('[AMQP][consumer] channel error', err));
  channel.on('close', () => logger.error('[AMQP][consumer] channel closed'));
  channel.prefetch(prefetch || 10);

  await Promise.all(topics.map(topic => channel.assertExchange(topic, 'topic', { durable: true })));

  const { queue } = await channel.assertQueue(queueName || '', { exclusive: true });

  topics.forEach(topic => {
    logger.info(`[AMQP][consumer] binding queue for topic: ${topic}`);
    channel.bindQueue(queue, topic, '#');
  });

  channel.consume(queue, message => {
    logger.info('[AMQP][consumer] received message: ', stringifyMessage(message));
    if (messageHandler && message) {
      messageHandler(message);
      channel.ack(message);
    }
  });

  logger.info('[AMQP][consumer] started with topics:', topics.join(' | '));

  return channel;
}

export async function startConsumersForGivenQueue(count: number, config: ConsumerConfig): Promise<Channel[]> {
  return Promise.all(
    Array(count)
      .fill(null)
      .map(() => startConsumer(config)),
  );
}
