import debug, { Debugger } from 'debug';

export interface ICommerceDebugger {
  error: Debugger;
  warn: Debugger;
  info: Debugger;
}

debug.formatters.d = (v: number) => new Date(v).toLocaleString();

const error = debug('ERROR');
const warn = debug('WARN');
const info = debug('INFO');

export const logger = {
  error,
  warn,
  info,
};

export const createLogger = (service: string): ICommerceDebugger => ({
  error: debug(`${service}:ERROR`),
  warn: debug(`${service}:WARN`),
  info: debug(`${service}:INFO`),
});
