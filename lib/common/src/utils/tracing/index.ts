import { blake2sHex } from 'blakejs';
import { formatISO } from 'date-fns';
import { Request } from 'express';

interface RequestInfo {
  domain?: string;
  ip?: string;
  userAgent?: string;
}

const hash = (input: string): string => blake2sHex(input);

export const genAnonymousUserId = (salt: string, request: RequestInfo): string =>
  hash(`${salt}|${request.domain ?? ''}|${request.ip ?? ''}|${request.userAgent ?? ''}`);

export const genAnonymousUserIdWithSecret = (secret: string, request: RequestInfo): string =>
  genAnonymousUserId(hash(`${secret}/${formatISO(new Date(), { representation: 'date' })}`), request);

export const genAnonymousUserIdFromRequest = (
  secret: string,
  req: Request,
): { id: string; requestInfo: { [key: string]: any } } => {
  const requestInfo = {
    domain: req.get('origin') || req.get('host'),
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };

  const id = genAnonymousUserIdWithSecret(secret, requestInfo);

  return { id, requestInfo };
};
