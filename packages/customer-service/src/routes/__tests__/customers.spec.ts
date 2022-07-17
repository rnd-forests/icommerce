import _get from 'lodash/get';
import request, { Response } from 'supertest';
import { app } from '../../app';
import { customerFactory } from '../../test';

const mockServiceGetById = jest.fn();
const mockServiceFindOrCreate = jest.fn();
jest.mock('../../services/customer.service', () => ({
  getById: (...args: any) => mockServiceGetById(...args),
  findOrCreate: (...args: any) => mockServiceFindOrCreate(...args),
}));

describe('Customer Endpoints', () => {
  afterEach(() => {
    mockServiceGetById.mockReset();
    mockServiceFindOrCreate.mockReset();
  });

  test('error: GET /v1/customers/:id', async () => {
    const customerId = '44777823-4664-452d-baf3-2d207f0ce3e7';
    mockServiceGetById.mockImplementation(() => {
      throw new Error('customer not found');
    });

    const response: Response = await request(app)
      .get(`/v1/customers/${customerId}`)
      .set('Accept', 'application/json')
      .send();

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: 'customer not found' });
  });

  test('succeeded: GET /v1/customers/:id', async () => {
    const customerId = 'f2035fd2-22a8-4827-bc8e-a6896d213885';
    mockServiceGetById.mockImplementation(() => customerFactory.build({ id: customerId }));

    const response: Response = await request(app)
      .get(`/v1/customers/${customerId}`)
      .set('Accept', 'application/json')
      .send();

    expect(response.statusCode).toBe(200);
    expect(_get(response.body, 'id')).toBe(customerId);
  });

  test('POST /v1/customers', async () => {
    const customerId = 'f04bd20d-46ff-46fc-bfb3-3c7b5f91e5b9';
    const fixture = customerFactory.build({ id: customerId });
    mockServiceFindOrCreate.mockImplementation(() => fixture);

    const response: Response = await request(app).post('/v1/customers/').set('Accept', 'application/json').send({
      firstName: fixture.firstName,
      lastName: fixture.lastName,
      phone: fixture.phone,
    });

    expect(response.statusCode).toBe(200);
    expect(_get(response.body, 'id')).toBe(customerId);
  });
});
