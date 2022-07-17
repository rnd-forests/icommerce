const { sequelize } = require('../../jest.setup');

const { defineModels } = require('./src/models');

defineModels(sequelize);
