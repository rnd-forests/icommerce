/* eslint-disable */

'use strict';

const { faker } = require('@faker-js/faker');

const fakeCustomers = new Array(500).fill(null).map(() => ({
  id: faker.datatype.uuid(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  phone: faker.phone.number(),
  createdAt: faker.datatype.datetime(),
  updatedAt: faker.datatype.datetime(),
}));

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('customers', fakeCustomers, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('customers', null, {});
  },
};
