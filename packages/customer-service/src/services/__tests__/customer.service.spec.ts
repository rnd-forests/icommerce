import { getById, findOrCreate } from '../customer.service';

const mockRepositoryGetById = jest.fn();
const mockRepositoryFindOrCreate = jest.fn();
jest.mock('../../database/repositories/customer', () => ({
  __esModule: true,
  getById: (...args: any) => mockRepositoryGetById(...args),
  findOrCreate: (...args: any) => mockRepositoryFindOrCreate(...args),
}));

describe('CustomerService', () => {
  it('fetches customer by id', async () => {
    const customerId = '1c3b64ac-6d6c-4e5a-b7fd-50cad160f011';
    await getById(customerId);
    expect(mockRepositoryGetById).toHaveBeenCalledTimes(1);
    expect(mockRepositoryGetById).toHaveBeenCalledWith(customerId);
  });

  it('validates customer attribute before creating', async () => {
    await expect(findOrCreate({ firstName: '', lastName: '', phone: '' })).rejects.toThrow(
      'Invalid customer attributes',
    );

    await expect(findOrCreate({ firstName: 'Foo', lastName: '', phone: '' })).rejects.toThrow(
      'Invalid customer attributes',
    );

    await expect(findOrCreate({ firstName: 'Foo', lastName: 'Bar', phone: '' })).rejects.toThrow(
      'Invalid customer attributes',
    );

    await expect(findOrCreate({ firstName: 'Foo', lastName: '', phone: '123456789' })).rejects.toThrow(
      'Invalid customer attributes',
    );
  });

  it('creates new customer with valid attributes', async () => {
    const attributes = { firstName: 'Foo', lastName: 'Bar', phone: '123456789' };
    await findOrCreate(attributes);
    expect(mockRepositoryFindOrCreate).toHaveBeenCalledTimes(1);
    expect(mockRepositoryFindOrCreate).toHaveBeenCalledWith(attributes);
  });
});
