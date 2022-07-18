import { ICommerceDebugger } from '@lib/common';
import Redis, { RedisOptions } from 'ioredis';

export function createRedisConnection(options: RedisOptions, logger: ICommerceDebugger) {
  const client = new Redis(options);

  client.on('ready', () => logger.info('[REDIS] connected'));
  client.on('error', err => logger.error('[REDIS] error', err));

  return client;
}
