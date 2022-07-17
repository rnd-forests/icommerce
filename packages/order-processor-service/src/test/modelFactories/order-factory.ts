import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { Order } from '../../models';

export const orderFactory = Factory.define<T.Order.OrderSchema>(({ onCreate }) => {
  onCreate(order => Order.build(order).save());

  return {
    id: faker.datatype.uuid(),
    customerId: faker.datatype.uuid(),
    status: 'new',
    total: parseFloat(faker.commerce.price()),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    phone: faker.phone.number(),
    createdAt: faker.datatype.datetime(),
    updatedAt: faker.datatype.datetime(),
  };
});
