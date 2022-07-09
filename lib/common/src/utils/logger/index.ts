import debug from 'debug';

debug.formatters.d = (v: number) => new Date(v).toLocaleString();

const error = debug('ERROR');
const warn = debug('WARN');
const info = debug('INFO');
const dev = debug('DEV');
const request = debug('REQUEST');
const parcel = debug('PARCEL');
const print = debug('PRINT');

export const logger = {
  error,
  warn,
  info,
  dev,
  request,
  parcel,
  print,
};
