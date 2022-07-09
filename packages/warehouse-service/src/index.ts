import { createLogger } from '@lib/common';
import { Microservice } from '@lib/microservice';
import { createPgConnection, initPgConnection } from '@lib/server';

const SERVICE_NAME = 'warehouse-service';

const logger = createLogger(SERVICE_NAME);

const dbConnection = createPgConnection(logger);

const { listen } = Microservice({
  serviceName: SERVICE_NAME,
  isProduction: process.env.NODE_ENV === 'production',
  serverCors: false,
  serverApiKey: process.env.SERVER_API_KEY || '',
  serverPort: parseInt(process.env.PORT || '3001', 10),
  serverJsonLimit: process.env.SERVER_JSON_LIMIT || '5mb',
  serverListenCb: async () => {
    await initPgConnection(dbConnection, logger);
  },
  serverExit: async () => {
    await dbConnection.close();
  },
  logger,
});

listen();
