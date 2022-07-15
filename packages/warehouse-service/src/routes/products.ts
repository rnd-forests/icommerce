import config from 'config';
import { middlewareAsync, rabbitmq } from '@lib/server';
import { ACTIVITY_TOPICS, genAnonymousUserIdFromRequest, USER_ACTIVITY_EVENTS } from '@lib/common';
import { Channel } from 'amqplib';
import { Request } from 'express';
import { getById, getAll } from '../services/product.service';
import { logger } from '../config';

const { USER_ACTIVITIES } = ACTIVITY_TOPICS;
const { USER_PRODUCT_VIEWED, USER_PRODUCT_SEARCH_FILTER } = USER_ACTIVITY_EVENTS;
const getProducer = (req: Request): Channel => req.app.get('user-activity-producer-channel') as Channel;
const getUserId = (req: Request) => genAnonymousUserIdFromRequest(config.get<string>('anonymousId.secret'), req);

export const getProductById = middlewareAsync(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await getById(id);

    const { id: userId, requestInfo } = getUserId(req);
    const eventSource = `${config.get<string>('serviceName')}:product:${product.id}`;
    const event = rabbitmq.constructEvent<T.Product.ProductSchema>(USER_PRODUCT_VIEWED, eventSource, product.toJSON(), {
      userid: userId,
      requestinfo: requestInfo,
    });
    rabbitmq.publish(getProducer(req), USER_ACTIVITIES, event, logger);

    return res.json(product);
  } catch (err) {
    return res.status(404).json({ message: (err as Error).message });
  }
});

export const getProducts = middlewareAsync(async (req, res) => {
  try {
    const results = await getAll(req.query);

    const { id: userId, requestInfo } = getUserId(req);
    const eventSource = `${config.get<string>('serviceName')}:products`;
    const event = rabbitmq.constructEvent<T.Events.UserSearchFilterProductsEventData>(
      USER_PRODUCT_SEARCH_FILTER,
      eventSource,
      {
        query: req.query,
        matchedProductIds: results.products.map(product => product.id),
      },
      { userid: userId, requestinfo: requestInfo },
    );
    rabbitmq.publish(getProducer(req), USER_ACTIVITIES, event, logger);

    return res.json(results);
  } catch (err) {
    return res.status(404).json({ message: (err as Error).message });
  }
});
