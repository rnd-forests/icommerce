import config from 'config';
import { Channel } from 'amqplib';
import { ORDER_TOPICS, WAREHOUSE_EVENTS } from '@lib/common';
import { rabbitmq } from '@lib/server';
import { logger } from '../config';
import { reserveProductStocks } from '../services/product.service';

export async function handleOrderPlacedEvent(producer: Channel, event: T.Events.OrderPlacedEvent) {
  const orderId = event.data!.id;
  const eventSource = `${config.get<string>('serviceName')}:order:${orderId}`;

  try {
    const succeeded = await reserveProductStocks(event.data!.orderItems);
    if (succeeded) {
      rabbitmq.publish(
        producer,
        ORDER_TOPICS.ORDER_PROCESSING,
        rabbitmq.constructEvent(WAREHOUSE_EVENTS.STOCK_RESERVED, eventSource, { orderId }),
        logger,
      );
    } else {
      rabbitmq.publish(
        producer,
        ORDER_TOPICS.ORDER_ERROR,
        rabbitmq.constructEvent(WAREHOUSE_EVENTS.STOCK_RESERVED_ERROR, eventSource, { orderId }),
        logger,
      );
    }
  } catch (err) {
    rabbitmq.publish(
      producer,
      ORDER_TOPICS.ORDER_ERROR,
      rabbitmq.constructEvent(WAREHOUSE_EVENTS.STOCK_RESERVED_ERROR, eventSource, { orderId }),
      logger,
    );
  }
}
