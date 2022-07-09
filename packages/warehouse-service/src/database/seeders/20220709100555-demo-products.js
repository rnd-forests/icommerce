/* eslint-disable */

'use strict';

const { faker } = require('@faker-js/faker');

const fakeProducts = new Array(500).fill(null).map(() => ({
  id: faker.datatype.uuid(),
  name: faker.commerce.productName(),
  price: faker.commerce.price(),
  branch: faker.commerce.productMaterial(),
  color: faker.color.human(),
  sku: faker.datatype.number({ min: 1, max: 100 }),
  createdAt: faker.datatype.datetime(),
  updatedAt: faker.datatype.datetime(),
}));

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('products', fakeProducts, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {});
  },
};
