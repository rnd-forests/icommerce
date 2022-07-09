/* eslint-disable */

'use strict';

const Sequelize = require('sequelize');

const TABLE_NAME = 'customers';

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        TABLE_NAME,
        {
          id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
          },
          firstName: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          lastName: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          phone: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
          },
        },
        { transaction },
      );

      await queryInterface.addIndex(TABLE_NAME, ['phone'], { unique: true, transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE_NAME);
  },
};
