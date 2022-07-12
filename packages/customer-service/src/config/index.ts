import config from 'config';
import { createLogger } from '@lib/common';
import { createPgConnection } from '@lib/server';

const logger = createLogger(config.get('serviceName'));
const dbConnection = createPgConnection(logger);

export { logger, dbConnection };
