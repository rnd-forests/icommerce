import { initPgConnection } from '@lib/server';
import { logger, dbConnection } from './config';
import { listen } from './app';

Promise.all([initPgConnection(dbConnection, logger)])
  .then(() => listen())
  .catch(() => {
    process.exitCode = 1;
    setTimeout(() => process.exit(1), 1000);
  });
