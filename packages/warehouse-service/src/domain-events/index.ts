import { Message } from 'amqplib';
import { ORDER_TOPICS } from '@lib/common';

export async function handleEventMessage(message: Message) {
  if (message.fields.exchange === ORDER_TOPICS.ORDER_PROCESSING) {
    const event = JSON.parse(message.content.toString()) as T.Events.OrderPlacedEvent;
    console.log({ event });
  }

  return Promise.resolve();
}
