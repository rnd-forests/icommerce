import config from 'config';
import { v4 as uuidv4 } from 'uuid';
import { Channel } from 'amqplib';
import { ORDER_TOPICS, ORDER_EVENTS, ACTIVITY_TOPICS, USER_ACTIVITY_EVENTS } from '@lib/common';
import { middlewareAsync, rabbitmq } from '@lib/server';
import { CloudEvent, Version } from 'cloudevents';
import { logger } from '../config';
import { createOrder as performOrderCreation } from '../services/order.service';
import { Order, OrderItem } from '../models';

const constructOrderEvent = (order: Order, eventType: string): CloudEvent<T.Events.OrderPlacedEventData> =>
  new CloudEvent<T.Events.OrderPlacedEventData>({
    id: uuidv4(),
    type: eventType,
    specversion: '1.0' as Version,
    source: `${config.get<string>('serviceName')}:order:${order.id}`,
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    // @ts-ignore
    data: order.toJSON(),
  });

export const createOrder = middlewareAsync(async (req, res) => {
  try {
    const payload = req.body as T.Order.OrderCreationAttributes;
    const order = await performOrderCreation(payload);
    if (!order) {
      return res.status(400).json({ error: 'Failed to create new order' });
    }

    const freshOrder = await Order.findOne({
      where: {
        id: order.id,
      },
      include: {
        model: OrderItem,
        as: 'orderItems',
      },
    });

    if (freshOrder) {
      rabbitmq.publish(
        req.app.get('order-producer-channel') as Channel,
        ORDER_TOPICS.ORDER_PROCESSING,
        constructOrderEvent(freshOrder, ORDER_EVENTS.ORDER_PLACED),
        logger,
      );
      rabbitmq.publish(
        req.app.get('user-activity-producer-channel') as Channel,
        ACTIVITY_TOPICS.USER_ACTIVITIES,
        constructOrderEvent(freshOrder, USER_ACTIVITY_EVENTS.USER_ORDER_PLACING),
        logger,
      );
    }

    return res.json(freshOrder);
  } catch (err) {
    return res.status(400).json({ message: (err as Error).message });
  }
});
