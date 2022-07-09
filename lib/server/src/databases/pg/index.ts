import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { ICommerceDebugger } from '@lib/common';

// Load database configurations form environment file.
// Here we are loading the environment variables from the .env file for local development.
function checkAndLoadConfig() {
  const ENV_MAPPING: { [key: string]: string } = {
    development: '.env',
  };
  const file: string = ENV_MAPPING[process.env.NODE_ENV || 'development'] || '';
  if (file) {
    const shouldLoad = ['POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD'].some(
      cfg => !process.env[cfg],
    );
    if (shouldLoad) {
      dotenv.config({ path: path.resolve(process.env.PWD || '', file) });
    }
  }
}

checkAndLoadConfig();

const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD } = process.env;

export const createPgConnection = (logger: ICommerceDebugger): Sequelize =>
  new Sequelize({
    dialect: 'postgres',
    host: POSTGRES_HOST || 'localhost',
    port: parseInt(POSTGRES_PORT || '5432', 10),
    database: POSTGRES_DB || 'postgres',
    username: POSTGRES_USER || 'postgres',
    password: POSTGRES_PASSWORD || 'postgres',
    pool: { min: 5, max: 50, acquire: 10000 },
    logging: (sql: string) => logger.info(sql),
  });

export const initPgConnection = async (connection: Sequelize, logger: ICommerceDebugger) => {
  try {
    await connection.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (e) {
    logger.error('Unable to connect to the database', e);
  }
};
