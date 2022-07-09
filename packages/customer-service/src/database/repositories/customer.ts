import { Identifier } from 'sequelize';
import Customer from '../../models/customer';

export const getById = async (id?: Identifier): Promise<Customer> => {
  const customer = await Customer.findByPk(id);
  if (!customer) {
    throw new Error('Customer not found');
  }
  return customer;
};

export const findOrCreate = async (attributes: T.Customer.CustomerCreationAttributes): Promise<Customer> => {
  const { firstName, lastName, phone } = attributes;
  const [customer] = await Customer.findOrCreate({
    where: { phone },
    defaults: { firstName, lastName, phone },
  });
  return customer;
};
