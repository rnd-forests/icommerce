import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { Product } from '../../models';

export const productFactory = Factory.define<T.Product.ProductSchema>(({ onCreate }) => {
  onCreate(product => Product.build(product).save());

  return {
    id: faker.datatype.uuid(),
    name: faker.commerce.productName(),
    price: parseFloat(faker.commerce.price()),
    branch: faker.commerce.productMaterial(),
    color: faker.color.human(),
    sku: faker.datatype.number({ min: 1, max: 100 }),
    createdAt: faker.datatype.datetime(),
    updatedAt: faker.datatype.datetime(),
  };
});
