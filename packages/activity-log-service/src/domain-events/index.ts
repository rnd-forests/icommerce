import { Message } from 'amqplib';
import { ORDER_TOPICS } from '@lib/common';
import { logger } from '../config';

export async function handleEventMessage(message: Message) {
  const topic = message.fields.exchange;
  const event = JSON.parse(message.content.toString()) as T.Events.GenericEvent;
  logger.info(`handling ${event.type} event, event id: ${event.id}`);

  if (topic === ORDER_TOPICS.ORDER_PROCESSING) {
    // if (event.type === ORDER_EVENTS.ORDER_PLACED) {
    //   await handleOrderPlacedEvent(producer, event);
    // }
  }

  if (topic === ORDER_TOPICS.ORDER_ERROR) {
    // if (event.type === WAREHOUSE_EVENTS.STOCK_RESERVED_ERROR) {
    //   await handleStockReservedError(event);
    // }
  }

  return Promise.resolve();
}
