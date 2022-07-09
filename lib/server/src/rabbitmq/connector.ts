/* eslint-disable @typescript-eslint/no-misused-promises */

import amqplib, { Connection } from 'amqplib';
import { ICommerceDebugger } from '@lib/common';

export async function connect(url: string, logger: ICommerceDebugger): Promise<Connection> {
  const connection = await amqplib.connect(url);

  connection.on('error', err => {
    if ((err as Error).message !== 'Connection closing') {
      logger.error('[AMQP] connection error', err);
    }
  });

  connection.on('close', () => {
    logger.error('[AMQP] connection closed, reconnecting');
    setTimeout(() => connect(url, logger), 5000);
  });

  logger.info('[AMQP] connected');

  return connection;
}
