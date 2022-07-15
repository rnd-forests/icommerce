import config from 'config';
import { middlewareAsync, rabbitmq } from '@lib/server';
import { ACTIVITY_TOPICS, genAnonymousUserIdFromRequest, USER_ACTIVITY_EVENTS } from '@lib/common';
import { Channel } from 'amqplib';
import { getById, getAll } from '../services/product.service';
import { logger } from '../config';

export const getProductById = middlewareAsync(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await getById(id);

    const eventSource = `${config.get<string>('serviceName')}:product:${product.id}`;
    const { id: userId, requestInfo } = genAnonymousUserIdFromRequest(config.get<string>('anonymousId.secret'), req);
    rabbitmq.publish(
      req.app.get('user-activity-producer-channel') as Channel,
      ACTIVITY_TOPICS.USER_ACTIVITIES,
      rabbitmq.constructEvent<T.Product.ProductSchema>(
        USER_ACTIVITY_EVENTS.USER_PRODUCT_VIEWED,
        eventSource,
        product.toJSON(),
        { userid: userId, requestinfo: requestInfo },
      ),
      logger,
    );

    return res.json(product);
  } catch (err) {
    return res.status(404).json({ message: (err as Error).message });
  }
});

export const getProducts = middlewareAsync(async (req, res) => {
  try {
    const results = await getAll(req.query);

    const eventSource = `${config.get<string>('serviceName')}:products`;
    const { id: userId, requestInfo } = genAnonymousUserIdFromRequest(config.get<string>('anonymousId.secret'), req);
    rabbitmq.publish(
      req.app.get('user-activity-producer-channel') as Channel,
      ACTIVITY_TOPICS.USER_ACTIVITIES,
      rabbitmq.constructEvent<T.Events.UserSearchFilterProductsEventData>(
        USER_ACTIVITY_EVENTS.USER_PRODUCT_SEARCH_FILTER,
        eventSource,
        {
          query: req.query,
          matchedProductIds: results.products.map(product => product.id),
        },
        { userid: userId, requestinfo: requestInfo },
      ),
      logger,
    );

    return res.json(results);
  } catch (err) {
    return res.status(404).json({ message: (err as Error).message });
  }
});
