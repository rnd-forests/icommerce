import _isUndefined from 'lodash/isUndefined';
import { Sequelize, Identifier, Op, OrderItem, Transaction } from 'sequelize';
import { dbConnection } from '../../config';
import Product from '../../models/product';
import { getPaginationLimit } from '../util';

export const getById = async (id?: Identifier): Promise<Product> => {
  const product = await Product.findByPk(id);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

export const fetchProducts = async ({
  search,
  filter,
  sortBy,
  limit,
  offset,
}: T.Product.FetchProductsFilters): Promise<{ products: Product[]; total: number }> => {
  const attributes = Object.keys(Product.getAttributes());

  const whereClause: { [key: string]: any } = {};
  const ordering: OrderItem[] = [];

  if (!_isUndefined(search)) {
    whereClause.product_search_vector = { [Op.match]: Sequelize.fn('to_tsquery', search) };
  }

  if (!_isUndefined(filter)) {
    const filterArray = filter.split(',');
    filterArray.forEach(segment => {
      const [attr, value] = segment.split(':');
      if (attr && attributes.includes(attr)) {
        whereClause[attr] = value;
      }
    });
  }

  if (!_isUndefined(sortBy)) {
    const sortByArray = sortBy.split(',');
    sortByArray.forEach(segment => {
      const [attr, direction] = segment.split(':');
      if (attr && attributes.includes(attr) && direction) {
        ordering.push([attr, direction]);
      }
    });
  }

  const { rows: products, count: total } = await Product.findAndCountAll({
    limit: getPaginationLimit(limit),
    offset: parseInt(offset || '', 10) || 0,
    where: whereClause,
    order: ordering,
  });

  return { products, total };
};

// The stock reserving process here is quite naive, just for the demo.
export const reserveProductStocks = async (
  orderItems: T.Order.OrderItemSchema[],
  transaction?: Transaction,
): Promise<boolean> => {
  const productIds = orderItems.map(item => item.itemId);
  const products = await Product.findAll({
    where: { id: { [Op.in]: productIds } },
    transaction,
  });

  // If some products is not available
  if (products.length !== orderItems.length) {
    return false;
  }

  // Checking product SKUs
  /* eslint-disable no-restricted-syntax */
  for (const product of products) {
    const orderItem = orderItems.find(item => item.itemId === product.id);
    if (orderItem && orderItem.quantity > product.sku) {
      return false;
    }
  }

  // Decrement SKUs
  await Promise.all(
    orderItems.map(item => Product.decrement({ sku: item.quantity }, { where: { id: item.itemId }, transaction })),
  );

  return true;
};

export const reserveProductStocksTransacting = async (orderItems: T.Order.OrderItemSchema[], conn = dbConnection) =>
  conn.transaction(async transaction => reserveProductStocks(orderItems, transaction));
