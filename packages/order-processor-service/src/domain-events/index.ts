import { Message } from 'amqplib';

export async function handleEventMessage(_message: Message) {
  return Promise.resolve();
}
