import { createOrder } from '../order.service';

const mockRepositoryCreateOrder = jest.fn();
jest.mock('../../database/repositories/order', () => ({
  createOrder: (...args: any) => mockRepositoryCreateOrder(...args),
}));

describe('OrderService', () => {
  it('validates customer attribute before creating', async () => {
    await expect(
      createOrder({ customer: { firstName: '', lastName: '', phone: '123131312' }, items: [] }),
    ).rejects.toThrow('Invalid order creation attributes');

    await expect(
      createOrder({ customer: { firstName: 'foo', lastName: 'bar', phone: '123131312' }, items: [] }),
    ).rejects.toThrow('Invalid order creation attributes');

    await expect(
      createOrder({
        customer: { firstName: 'foo', lastName: 'bar', phone: '123131312' },
        items: [{ id: '', price: 2.99, quantity: 5 }],
      }),
    ).rejects.toThrow('Invalid order creation attributes');
  });

  it('creates new customer with valid attributes', async () => {
    const attributes = {
      customer: { firstName: 'foo', lastName: 'bar', phone: '123131312' },
      items: [{ id: '4c3b09ee-f76b-4556-b3db-f2b67b21505b', price: 2.99, quantity: 5 }],
    };
    await createOrder(attributes);
    expect(mockRepositoryCreateOrder).toHaveBeenCalledTimes(1);
  });
});
