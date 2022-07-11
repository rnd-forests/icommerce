import * as yup from 'yup';
import { Identifier } from 'sequelize';
import Customer from '../models/customer';
import * as customerRepository from '../database/repositories/customer';

export const getById = async (id?: Identifier): Promise<Customer> => customerRepository.getById(id);

export const findOrCreate = async (attributes: T.Customer.CustomerCreationAttributes): Promise<Customer> => {
  const schema = yup.object().shape({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    phone: yup.string().required(),
  });

  if (!(await schema.isValid(attributes))) {
    throw new Error('Invalid customer attributes');
  }

  return customerRepository.findOrCreate(attributes);
};
