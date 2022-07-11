/* eslint-disable */

'use strict';

const Sequelize = require('sequelize');

const TABLE_NAME = 'order_items';

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
          orderId: {
            type: Sequelize.UUID,
            allowNull: false,
          },
          itemId: {
            type: Sequelize.UUID,
            allowNull: false,
          },
          price: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
          },
          quantity: {
            type: Sequelize.INTEGER,
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

      await queryInterface.addIndex(TABLE_NAME, ['orderId'], { transaction });
      await queryInterface.addIndex(TABLE_NAME, ['itemId'], { transaction });
      await queryInterface.addConstraint(TABLE_NAME, {
        fields: ['orderId'],
        type: 'foreign key',
        references: {
          table: 'orders',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
        transaction,
      });

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
