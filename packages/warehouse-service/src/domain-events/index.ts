import { Message, Channel } from 'amqplib';
import { ORDER_TOPICS, ORDER_EVENTS, WAREHOUSE_EVENTS } from '@lib/common';
import { handleOrderPlacedEvent } from './order.placed';
import { logger } from '../config';
import { handleStockReservedError } from './stock.reserved.error';

export async function handleEventMessage(producer: Channel, message: Message) {
  const topic = message.fields.exchange;
  const event = JSON.parse(message.content.toString()) as T.Events.GenericEvent;
  logger.info(`handling ${event.type} event, event id: ${event.id}`);

  if (topic === ORDER_TOPICS.ORDER_PROCESSING) {
    if (event.type === ORDER_EVENTS.ORDER_PLACED) {
      await handleOrderPlacedEvent(producer, event);
    }
  }

  if (topic === ORDER_TOPICS.ORDER_ERROR) {
    if (event.type === WAREHOUSE_EVENTS.STOCK_RESERVED_ERROR) {
      await handleStockReservedError(event);
    }
  }

  return Promise.resolve();
}
