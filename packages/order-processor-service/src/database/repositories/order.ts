import Order from '../../models/order';

export const createOrder = async (attributes: T.Order.OrderCreationAttributes): Promise<Order> => {
  console.log({ attributes });
  return new Order();
};
