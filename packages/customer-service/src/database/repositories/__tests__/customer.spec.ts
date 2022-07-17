import { customerFactory } from '../../../test';
import { getById, findOrCreate } from '../customer';

describe('CustomerRepository', () => {
  it('throws error when fetching non-existing customer', async () => {
    await expect(getById('cbce2aef-6da9-4d4a-8b1a-87c20e6b738b')).rejects.toThrow('Customer not found');
  });

  it('fetches customer by id', async () => {
    const customer = await customerFactory.create();
    const freshCustomer = await getById(customer.id);
    expect(freshCustomer).not.toBeNull();
    expect(freshCustomer?.id).toEqual(customer.id);
  });

  it('creates new customer based on provided attributes', async () => {
    const attributes = { firstName: 'Foo', lastName: 'Bar', phone: '1234567890' };

    const customer = await findOrCreate(attributes);
    expect(customer).not.toBeNull();

    const refechedCustomer = await findOrCreate(attributes);
    expect(refechedCustomer.id).toEqual(customer.id);
  });
});
