import config from 'config';
import { v4 as uuidv4 } from 'uuid';
import { Channel } from 'amqplib';
import { CloudEvent, Version } from 'cloudevents';
import { ORDER_TOPICS, WAREHOUSE_EVENTS } from '@lib/common';
import { rabbitmq } from '@lib/server';
import { logger } from '../config';
import { reserveProductStocks } from '../services/product.service';

const buildEvent = (type: string, orderId: string) =>
  new CloudEvent({
    id: uuidv4(),
    type,
    specversion: '1.0' as Version,
    source: `${config.get<string>('serviceName')}:order:${orderId}`,
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    data: {
      orderId,
    },
  });

export async function handleOrderPlacedEvent(producer: Channel, event: T.Events.OrderPlacedEvent) {
  const orderId = event.data!.id;
  try {
    const succeeded = await reserveProductStocks(event.data!.orderItems);
    if (succeeded) {
      rabbitmq.publish(
        producer,
        ORDER_TOPICS.ORDER_PROCESSING,
        buildEvent(WAREHOUSE_EVENTS.STOCK_RESERVED, orderId),
        logger,
      );
    } else {
      rabbitmq.publish(
        producer,
        ORDER_TOPICS.ORDER_ERROR,
        buildEvent(WAREHOUSE_EVENTS.STOCK_RESERVED_ERROR, orderId),
        logger,
      );
    }
  } catch (err) {
    rabbitmq.publish(
      producer,
      ORDER_TOPICS.ORDER_ERROR,
      buildEvent(WAREHOUSE_EVENTS.STOCK_RESERVED_ERROR, orderId),
      logger,
    );
  }
}
