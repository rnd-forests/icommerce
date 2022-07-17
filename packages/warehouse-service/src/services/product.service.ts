import { Identifier } from 'sequelize';
import Product from '../models/product';
import * as productRepository from '../database/repositories/product';

export const getById = async (id?: Identifier): Promise<Product> => productRepository.getById(id);

export const getAll = async (filter: T.Product.FetchProductsFilters): Promise<{ products: Product[]; total: number }> =>
  productRepository.fetchProducts(filter);

export const reserveProductStocks = async (orderItems: T.Order.OrderItemSchema[]): Promise<boolean> =>
  productRepository.reserveProductStocksTransacting(orderItems);
