import { dbConnection } from '../config';
import Customer, { defineOrder } from './customer';

export const defineModels = (conn = dbConnection) => {
  defineOrder(conn, Customer);
};

export { Customer };
