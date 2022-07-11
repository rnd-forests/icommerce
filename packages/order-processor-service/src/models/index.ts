import { dbConnection } from '../config';
import { Order, defineOrder } from './order';
import { OrderItem, defineOrderItem } from './orderitem';
import { Transaction, defineTransaction } from './transaction';

export const defineModels = () => {
  defineOrder(dbConnection, Order);
  defineOrderItem(dbConnection, OrderItem);
  defineTransaction(dbConnection, Transaction);

  Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
  Order.hasOne(Transaction, { foreignKey: 'orderId' });
};

export { Order, OrderItem, Transaction };
