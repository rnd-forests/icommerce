import { Message } from 'amqplib';
import { ACTIVITY_TOPICS, USER_ACTIVITY_EVENTS } from '@lib/common';
import { logger } from '../config';

async function handleOrderPlacedEvent(event: T.Events.UserPlacedOrderEvent): Promise<void> {
  //
}

export async function handleEventMessage(message: Message) {
  const topic = message.fields.exchange;
  const event = JSON.parse(message.content.toString()) as T.Events.GenericEvent;
  logger.info(`handling ${event.type} event, event id: ${event.id}`);

  if (topic === ACTIVITY_TOPICS.USER_ACTIVITIES) {
    if (event.type === USER_ACTIVITY_EVENTS.USER_ORDER_PLACING) {
      await handleOrderPlacedEvent(event as T.Events.UserPlacedOrderEvent);
    }
  }

  return Promise.resolve();
}
