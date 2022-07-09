/* eslint-disable */

'use strict';

const Sequelize = require('sequelize');

const TABLE_NAME = 'orders';

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable(
        TABLE_NAME,
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
          },
          customerId: {
            type: Sequelize.UUID,
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM('new', 'complete'),
            allowNull: false,
          },
          total: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
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
          },
          updatedAt: {
            type: Sequelize.DATE,
          },
        },
        { transaction },
      );

      await queryInterface.addIndex(TABLE_NAME, ['customerId'], { transaction });

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
