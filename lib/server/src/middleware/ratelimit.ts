import { genAnonymousUserIdFromRequest } from '@lib/common';
import rateLimit, { Options as RateLimitOptions } from 'express-rate-limit';
import Redis from 'ioredis';
import RedisStore from 'rate-limit-redis';

export const createRatelimitMiddleware = (
  client: Redis,
  rateLimitOptions: Partial<RateLimitOptions>,
  keyGeneratorSecret: string,
  keyPrefix?: string,
) => {
  const { max, windowMs } = rateLimitOptions;
  return rateLimit({
    max: max || 100,
    windowMs: windowMs || 15 * 60 * 1000, // default to 15 minutes
    standardHeaders: true,
    handler: (_request, response, _next, options) =>
      response.status(options.statusCode).json({ message: options.message as string }),
    keyGenerator: request => {
      const { id } = genAnonymousUserIdFromRequest(keyGeneratorSecret, request);
      return id;
    },
    store: new RedisStore({
      // @ts-expect-error - the `call` function is not present in @types/ioredis
      sendCommand: (...args: string[]) => client.call(...args),
      prefix: `${keyPrefix || 'ratelimit'}:`,
    }),
  });
};
