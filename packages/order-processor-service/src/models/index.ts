import { dbConnection } from '../config';
import { Order, defineOrder } from './order';
import { OrderItem, defineOrderItem } from './orderitem';
import { Transaction, defineTransaction } from './transaction';

export const defineModels = (conn = dbConnection) => {
  defineOrder(conn, Order);
  defineOrderItem(conn, OrderItem);
  defineTransaction(conn, Transaction);

  Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
  Order.hasOne(Transaction, { foreignKey: 'orderId' });
};

export { Order, OrderItem, Transaction };
