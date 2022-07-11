import { Message } from 'amqplib';
import { logger } from '../config';

export async function handleEventMessage(message: Message) {
  logger.info(message);
  return Promise.resolve();
}
