/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import _get from 'lodash/get';
import request, { Response } from 'supertest';
import { app } from '../../app';
import { Product } from '../../models';
import { productFactory } from '../../test';

const mockServiceGetById = jest.fn();
const mockServiceGetAll = jest.fn();
jest.mock('../../services/product.service', () => ({
  getById: (...args: any) => mockServiceGetById(...args),
  getAll: (...args: any) => mockServiceGetAll(...args),
}));

jest.mock('@lib/common', () => ({
  ...jest.requireActual('@lib/common'),
  genAnonymousUserIdFromRequest: jest.fn().mockReturnValue('test-id'),
}));

const mockRabbitMqPublish = jest.fn();
const mockRabbitMqConstructEvent = jest.fn();
jest.mock('@lib/server', () => ({
  ...jest.requireActual('@lib/server'),
  rabbitmq: {
    publish: (...args: any) => mockRabbitMqPublish(...args),
    constructEvent: (...args: any) => mockRabbitMqConstructEvent(...args),
  },
}));

jest.useFakeTimers().setSystemTime(new Date('2022-01-01').getTime());

describe('Product Endpoints', () => {
  afterEach(() => {
    mockServiceGetById.mockReset();
    mockServiceGetAll.mockReset();
  });

  test('error: GET /v1/products/:id', async () => {
    const productId = '44777823-4664-452d-baf3-2d207f0ce3e7';
    mockServiceGetById.mockImplementation(() => {
      throw new Error('product not found');
    });

    const response: Response = await request(app)
      .get(`/v1/products/${productId}`)
      .set('Accept', 'application/json')
      .send();

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: 'product not found' });
  });

  test('succeeded: GET /v1/products/:id', async () => {
    const productId = 'f2035fd2-22a8-4827-bc8e-a6896d213885';
    mockServiceGetById.mockImplementation(() =>
      Product.build(
        productFactory.build({
          id: productId,
          name: 'test',
          price: 2.99,
          branch: 'luxury',
          color: 'red',
          sku: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    );

    mockRabbitMqConstructEvent.mockImplementation(() => ({ name: 'test' }));

    const response: Response = await request(app)
      .get(`/v1/products/${productId}`)
      .set('Accept', 'application/json')
      .send();

    expect(response.statusCode).toBe(200);
    expect(_get(response.body, 'id')).toBe(productId);

    expect(mockRabbitMqConstructEvent).toHaveBeenCalledTimes(1);
    expect(mockRabbitMqConstructEvent.mock.calls[0]).toMatchSnapshot();

    expect(mockRabbitMqPublish).toHaveBeenCalledTimes(1);
    expect(mockRabbitMqPublish.mock.calls[0]).toMatchSnapshot();
  });

  test('GET /v1/products', async () => {
    mockServiceGetAll.mockImplementation(() => ({
      products: [
        Product.build(
          productFactory.build({
            id: '35648c7d-1819-4556-a0ce-c7e496089880',
            name: 'test',
            price: 2.99,
            branch: 'luxury',
            color: 'red',
            sku: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      ],
    }));

    const response: Response = await request(app).get(`/v1/products`).set('Accept', 'application/json').send();

    expect(response.statusCode).toBe(200);

    expect(mockRabbitMqConstructEvent).toHaveBeenCalledTimes(1);
    expect(mockRabbitMqConstructEvent.mock.calls[0]).toMatchSnapshot();

    expect(mockRabbitMqPublish).toHaveBeenCalledTimes(1);
    expect(mockRabbitMqPublish.mock.calls[0]).toMatchSnapshot();
  });
});
