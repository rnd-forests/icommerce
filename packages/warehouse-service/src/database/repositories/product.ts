import _isUndefined from 'lodash/isUndefined';
import { Sequelize, Identifier, Op, OrderItem } from 'sequelize';
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
