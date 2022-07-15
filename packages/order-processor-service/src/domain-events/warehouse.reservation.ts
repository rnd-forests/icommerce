import config from 'config';
import { Channel } from 'amqplib';
import { rabbitmq } from '@lib/server';
import { ORDER_EVENTS, ORDER_TOPICS } from '@lib/common';
import { Order } from '../models';
import { ORDER_STATUSES } from '../models/order';
import { logger } from '../config';

// For demo purposes, we just update order status to COMPLETE an  publish the ORDER_COMPLETED event
// to notify other parts in our system.
export async function handleWarehouseReservedEvent(producer: Channel, event: T.Events.StockReservedEvent) {
  const { orderId } = event.data!;
  await Order.update({ status: ORDER_STATUSES.COMPLETE }, { where: { id: orderId } });

  const order = await Order.findOne({
    where: {
      id: orderId,
    },
  });

  rabbitmq.publish(
    producer,
    ORDER_TOPICS.ORDER_PROCESSING,
    rabbitmq.constructEvent(
      ORDER_EVENTS.ORDER_COMPLETED,
      `${config.get<string>('serviceName')}:order:${order!.id}`,
      order!,
    ),
    logger,
  );
}

// For demo purposes, we just update order status to PENDING
export async function handleWarehouseReservedErrorEvent(event: T.Events.StockReservedEvent) {
  const { orderId } = event.data!;
  await Order.update({ status: ORDER_STATUSES.PENDING }, { where: { id: orderId } });
}
