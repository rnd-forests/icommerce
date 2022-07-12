import { logger } from '../config';

// Here we will trigger the compensation for stock reservation error event.
// We put a simple log message here to demonstrate the compensation process.
// In real-world application, we may perform many actions to compensate the error.
export function handleStockReservedError(event: T.Events.StockReservedErrorEvent) {
  logger.info(`triggering compensation for stock reservation error, order id: ${event.data!.orderId}`);
}
