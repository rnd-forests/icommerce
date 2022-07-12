import { Message, Channel } from 'amqplib';
import { ORDER_TOPICS, WAREHOUSE_EVENTS } from '@lib/common';
import { logger } from '../config';
import { handleWarehouseReservedEvent, handleWarehouseReservedErrorEvent } from './warehouse.reservation';

export async function handleEventMessage(producer: Channel, message: Message) {
  const topic = message.fields.exchange;
  const event = JSON.parse(message.content.toString()) as T.Events.GenericEvent;
  logger.info(`handling ${event.type} event, event id: ${event.id}`);

  if (topic === ORDER_TOPICS.ORDER_PROCESSING) {
    if (event.type === WAREHOUSE_EVENTS.STOCK_RESERVED) {
      await handleWarehouseReservedEvent(producer, event);
    }
  }

  if (topic === ORDER_TOPICS.ORDER_ERROR) {
    if (event.type === WAREHOUSE_EVENTS.STOCK_RESERVED_ERROR) {
      await handleWarehouseReservedErrorEvent(event);
    }
  }

  return Promise.resolve();
}
