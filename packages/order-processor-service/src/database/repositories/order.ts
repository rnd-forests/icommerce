import { Transaction as SequelizeTransaction } from 'sequelize';
import { dbConnection } from '../../config';
import { fetchCustomer } from './customer';
import { Order, OrderItem, Transaction } from '../../models';
import { ORDER_STATUSES } from '../../models/order';
import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from '../../models/transaction';

export const createOrderInternal = async (
  attributes: T.Order.OrderCreationAttributes,
  transaction?: SequelizeTransaction,
  jwtServer?: string,
): Promise<Order | null> => {
  // Fetch customer information from customer service.
  // This will fetch the existing customer or creating new one if it doesn't exist.
  // This is a blocking call to customer service.
  const customer = await fetchCustomer(attributes.customer, jwtServer);
  if (!customer) {
    return null;
  }

  const total = attributes.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const order = await Order.create(
    {
      customerId: customer.id,
      status: ORDER_STATUSES.NEW,
      total,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
    },
    { transaction },
  );

  await Promise.all([
    OrderItem.bulkCreate(
      attributes.items.map(item => ({
        itemId: item.id,
        orderId: order.id,
        price: item.price,
        quantity: item.quantity,
      })),
      { transaction },
    ),
    Transaction.create(
      {
        customerId: customer.id,
        orderId: order.id,
        type: TRANSACTION_TYPES.GENERAL,
        status: TRANSACTION_STATUSES.NEW,
      },
      { transaction },
    ),
  ]);

  return order;
};

export const createOrder = async (
  attributes: T.Order.OrderCreationAttributes,
  jwtServer?: string,
): Promise<Order | null> => {
  try {
    return await dbConnection.transaction(async transaction => createOrderInternal(attributes, transaction, jwtServer));
  } catch (error) {
    return null;
  }
};
