import config from 'config';
import { v4 as uuidv4 } from 'uuid';
import { Channel } from 'amqplib';
import { ORDER_TOPICS, ORDER_EVENTS } from '@lib/common';
import { middlewareAsync, rabbitmq } from '@lib/server';
import { CloudEvent, Version } from 'cloudevents';
import { logger } from '../config';
import { createOrder as performOrderCreation } from '../services/order.service';
import { Order, OrderItem } from '../models';

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
      const event = new CloudEvent({
        id: uuidv4(),
        type: ORDER_EVENTS.ORDER_PLACED,
        specversion: '1.0' as Version,
        source: `${config.get<string>('serviceName')}:order:${order.id}`,
        time: new Date().toISOString(),
        datacontenttype: 'application/json',
        data: freshOrder.toJSON(),
      });
      rabbitmq.publish(req.app.get('producer-channel') as Channel, ORDER_TOPICS.ORDER_PROCESSING, event, logger);
    }

    return res.json(freshOrder);
  } catch (err) {
    return res.status(400).json({ message: (err as Error).message });
  }
});
