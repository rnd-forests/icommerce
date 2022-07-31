/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { RequestHandler } from 'express';
import request, { Response } from 'supertest';
import { app } from '../../app';
import { orderFactory } from '../../test';

const mockServiceCreateOrder = jest.fn();
jest.mock('../../services/order.service', () => ({
  createOrder: (...args: any) => mockServiceCreateOrder(...args),
}));

jest.mock('@lib/common', () => ({
  ...jest.requireActual('@lib/common'),
  genAnonymousUserIdFromRequest: jest.fn().mockReturnValue('test-id'),
}));

const mockRabbitMqPublish = jest.fn();
const mockRabbitMqConstructEvent = jest.fn();
jest.mock('@lib/server', () => {
  const middlewareDummy: RequestHandler = (_req, _res, next) => next();
  return {
    ...jest.requireActual('@lib/server'),
    createRedisConnection: jest.fn(),
    createRatelimitMiddleware: jest.fn().mockReturnValue(middlewareDummy),
    rabbitmq: {
      publish: (...args: any) => mockRabbitMqPublish(...args),
      constructEvent: (...args: any) => mockRabbitMqConstructEvent(...args),
    },
  };
});

jest.useFakeTimers().setSystemTime(new Date('2022-01-01').getTime());

describe('Order Endpoints', () => {
  test('POST /v1/orders', async () => {
    const order = await orderFactory.create({
      id: '0d353781-594f-40d6-9f1e-66e47cc883ae',
      customerId: '7cbf9769-ca46-4b3a-bb04-d91e93934eb7',
      status: 'new',
      total: 29.99,
      firstName: 'foo',
      lastName: 'bar',
      phone: '12313123123',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockServiceCreateOrder.mockImplementation(() => order);

    const attributes = {
      customer: { firstName: 'foo', lastName: 'bar', phone: '123131312' },
      items: [{ id: '4c3b09ee-f76b-4556-b3db-f2b67b21505b', price: 2.99, quantity: 5 }],
    };
    const response: Response = await request(app).post('/v1/orders').set('Accept', 'application/json').send(attributes);

    expect(response.statusCode).toBe(200);
    expect(mockServiceCreateOrder).toHaveBeenCalledTimes(1);

    expect(mockRabbitMqConstructEvent).toHaveBeenCalledTimes(2);
    expect(mockRabbitMqConstructEvent.mock.calls).toMatchSnapshot();

    expect(mockRabbitMqPublish).toHaveBeenCalledTimes(2);
    expect(mockRabbitMqPublish.mock.calls).toMatchSnapshot();
  });
});
