import config from 'config';
import { Request } from 'express';
import { Channel } from 'amqplib';
import {
  ORDER_TOPICS,
  ORDER_EVENTS,
  ACTIVITY_TOPICS,
  USER_ACTIVITY_EVENTS,
  genAnonymousUserIdFromRequest,
} from '@lib/common';
import { middlewareAsync, rabbitmq } from '@lib/server';
import { logger } from '../config';
import { createOrder as performOrderCreation } from '../services/order.service';
import { Order, OrderItem } from '../models';

const fireEvents = (order: Order, req: Request) => {
  const eventSource = `${config.get<string>('serviceName')}:order:${order.id}`;

  rabbitmq.publish(
    req.app.get('order-producer-channel') as Channel,
    ORDER_TOPICS.ORDER_PROCESSING,
    rabbitmq.constructEvent<T.Events.OrderPlacedEventData>(ORDER_EVENTS.ORDER_PLACED, eventSource, order.toJSON()),
    logger,
  );

  const { id, requestInfo } = genAnonymousUserIdFromRequest(config.get<string>('anonymousId.secret'), req);
  rabbitmq.publish(
    req.app.get('user-activity-producer-channel') as Channel,
    ACTIVITY_TOPICS.USER_ACTIVITIES,
    rabbitmq.constructEvent<T.Events.OrderPlacedEventData>(
      USER_ACTIVITY_EVENTS.USER_ORDER_PLACED,
      eventSource,
      order.toJSON(),
      { userid: id, requestinfo: requestInfo },
    ),
    logger,
  );
};

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
      fireEvents(freshOrder, req);
    }

    return res.json(freshOrder);
  } catch (err) {
    return res.status(400).json({ message: (err as Error).message });
  }
});
