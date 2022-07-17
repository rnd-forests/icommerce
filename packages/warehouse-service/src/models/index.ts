import { dbConnection } from '../config';
import Product, { defineProduct } from './product';

export const defineModels = (conn = dbConnection) => {
  defineProduct(conn, Product);
};

export { Product };
