/* eslint-disable @typescript-eslint/no-misused-promises */

import amqplib, { Connection } from 'amqplib';
import { ICommerceDebugger } from '@lib/common';

interface ConnectionConfig {
  url: string;
  connectionName: string;
  logger: ICommerceDebugger;
}

export async function connect({ url, connectionName, logger }: ConnectionConfig): Promise<Connection> {
  const connection = await amqplib.connect(url, { clientProperties: { connection_name: connectionName } });

  connection.on('error', err => {
    if ((err as Error).message !== 'Connection closing') {
      logger.error('[AMQP] connection error', err);
    }
  });

  connection.on('close', () => {
    logger.error('[AMQP] connection closed, reconnecting');
    setTimeout(() => connect({ url, connectionName, logger }), 5000);
  });

  logger.info('[AMQP] connected');

  return connection;
}
