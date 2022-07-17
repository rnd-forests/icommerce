import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { Customer } from '../../models';

export const customerFactory = Factory.define<T.Customer.CustomerSchema>(({ onCreate }) => {
  onCreate(customer => Customer.build(customer).save());

  return {
    id: uuidv4(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    phone: faker.phone.number(),
    createdAt: faker.datatype.datetime(),
    updatedAt: faker.datatype.datetime(),
  };
});
