import { middlewareAsync } from '@lib/server';
import { createOrder as performOrderCreation } from '../database/services/order.service';

export const createOrder = middlewareAsync(async (req, res) => {
  try {
    const payload = req.body as T.Order.OrderCreationAttributes;
    return res.json(await performOrderCreation(payload));
  } catch (err) {
    return res.status(400).json({ message: (err as Error).message });
  }
});
