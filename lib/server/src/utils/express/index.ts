import { Server } from 'http';
import { logger } from '@lib/common';

export const expressServerListen = (port: number) => () => {
  try {
    logger.info(`Server running on ${port}`);
    if (process && process.send) {
      process.send('ready');
    }
  } catch (e) {
    logger.error('Error starting server', e);
  }
};

export const expressExitHandler = (server: Server) => (callback: () => void) => {
  logger.info('Process Exiting');
  server.close((err: any) => {
    logger.error('Error closing server', err);
    callback();
  });
};
