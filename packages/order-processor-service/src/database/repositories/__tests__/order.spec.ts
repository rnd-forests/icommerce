/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { OrderItem, Transaction } from '../../../models';
import { ORDER_STATUSES } from '../../../models/order';
import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from '../../../models/transaction';
import { createOrderInternal } from '../order';

const mockFetchCustomer = jest.fn();
jest.mock('../customer', () => ({
  fetchCustomer: (...args: any) => mockFetchCustomer(...args),
}));

const testCustomer: T.Customer.CustomerSchema = {
  id: '767d72a0-1257-458b-baf4-f75d20ea4fb1',
  firstName: 'Foo',
  lastName: 'Bar',
  phone: '123456789',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('OrderRepository', () => {
  it('returns null when fetching customer information failed', async () => {
    mockFetchCustomer.mockImplementation(() => null);
    const order = await createOrderInternal({
      customer: { firstName: 'foo', lastName: 'bar', phone: '123131312' },
      items: [{ id: '4c3b09ee-f76b-4556-b3db-f2b67b21505b', price: 2.99, quantity: 5 }],
    });
    expect(order).toBeNull();
  });

  it('creates new order with associated order items and transaction', async () => {
    mockFetchCustomer.mockImplementation(() => testCustomer);
    const order = await createOrderInternal({
      customer: { firstName: 'foo', lastName: 'bar', phone: '123131312' },
      items: [
        { id: '4c3b09ee-f76b-4556-b3db-f2b67b21505b', price: 2.99, quantity: 5 },
        { id: '481f2c33-3f49-40a7-aabb-e08590c685f6', price: 3.99, quantity: 6 },
        { id: 'bee0b23b-b9fc-4d90-b66e-0d8fea8c7453', price: 4.99, quantity: 7 },
      ],
    });

    expect(order).toBeDefined();
    expect(order?.status).toEqual(ORDER_STATUSES.NEW);
    expect(order?.customerId).toEqual(testCustomer.id);
    expect(order?.firstName).toEqual(testCustomer.firstName);
    expect(order?.lastName).toEqual(testCustomer.lastName);
    expect(order?.phone).toEqual(testCustomer.phone);
    expect(order?.total).toEqual('73.82');

    const orderItems = await OrderItem.findAll({ where: { orderId: order?.id } });
    expect(orderItems).toHaveLength(3);

    const transaction = await Transaction.findOne({ where: { orderId: order?.id } });
    expect(transaction).toBeDefined();
    expect(transaction?.customerId).toEqual(testCustomer.id);
    expect(transaction?.orderId).toEqual(order?.id);
    expect(transaction?.type).toEqual(TRANSACTION_TYPES.GENERAL);
    expect(transaction?.status).toEqual(TRANSACTION_STATUSES.NEW);
  });
});
