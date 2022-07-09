/* eslint-disable */

'use strict';

const Sequelize = require('sequelize');

const TABLE_NAME = 'products';
const SEARCH_VECTOR_NAME = 'product_search_vector';
const SEARCHABLE_ATTRIBUTES = {
  products: ['name', 'branch', 'color'],
};

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
          name: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          [SEARCH_VECTOR_NAME]: {
            type: Sequelize.TSVECTOR,
            allowNull: false,
          },
          price: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
          },
          branch: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          color: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          sku: {
            type: Sequelize.INTEGER,
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

      await queryInterface.addIndex(TABLE_NAME, ['branch', 'color'], { transaction });

      /**
       * Create FULLTEXT search index and triggers to update that index
       */
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE_NAME} SET ${SEARCH_VECTOR_NAME} = to_tsvector('english', ${SEARCHABLE_ATTRIBUTES[
          TABLE_NAME
        ].join(" || ' ' || ")});`,
        { transaction },
      );
      await queryInterface.sequelize.query(
        `CREATE INDEX ${TABLE_NAME}_search ON ${TABLE_NAME} USING gin(${SEARCH_VECTOR_NAME});`,
        { transaction },
      );
      await queryInterface.sequelize.query(
        `
        CREATE TRIGGER ${TABLE_NAME}_vector_update
        BEFORE INSERT OR UPDATE ON ${TABLE_NAME}
        FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(${SEARCH_VECTOR_NAME}, 'pg_catalog.english', ${SEARCHABLE_ATTRIBUTES[
          TABLE_NAME
        ].join(', ')});`,
        { transaction },
      );

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
