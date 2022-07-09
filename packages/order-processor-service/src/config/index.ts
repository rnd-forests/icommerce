import { createLogger } from '@lib/common';
import { createPgConnection } from '@lib/server';

const SERVICE_NAME = 'order-processor-service';
const logger = createLogger(SERVICE_NAME);
const dbConnection = createPgConnection(logger);

export { SERVICE_NAME, logger, dbConnection };
