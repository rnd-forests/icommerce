import { Connection, Channel } from 'amqplib';
import { CloudEvent } from 'cloudevents';
import { ICommerceDebugger } from '@lib/common';

export async function startProducer(
  connection: Connection,
  topics: string[],
  logger: ICommerceDebugger,
): Promise<Channel> {
  const channel = await connection.createChannel();
  channel.on('error', err => logger.error('[AMQP][producer] channel error', err));
  channel.on('close', () => logger.error('[AMQP][producer] channel closed'));

  await Promise.all(topics.map(topic => channel.assertExchange(topic, 'topic', { durable: true })));
  logger.info('[AMQP][producer] started with topics:', topics.join(' | '));

  return channel;
}

export function publish<T>(channel: Channel, topic: string, event: CloudEvent<T>, logger: ICommerceDebugger) {
  logger.info(`[AMQP][producer] publishing message to topic: ${topic}`);
  channel.publish(topic, '#', Buffer.from(event.toString()));
}
