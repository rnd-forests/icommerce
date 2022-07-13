import config from 'config';
import { createLogger } from '@lib/common';

const logger = createLogger(config.get('serviceName'));

export { logger };
