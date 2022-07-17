import { addDays } from 'date-fns';
import { Product } from '../../../models';
import { productFactory } from '../../../test';
import { getById, fetchProducts } from '../product';

async function seedProducts() {
  return Promise.all([
    productFactory.create({
      name: 'Elegant Product',
      color: 'red',
      branch: 'luxury',
      createdAt: new Date(),
    }),

    productFactory.create({
      name: 'Awesome Product',
      color: 'red',
      branch: 'super luxury',
      createdAt: addDays(new Date(), 2),
    }),

    productFactory.create({
      name: 'Awful Product',
      color: 'green',
      branch: 'normal',
      createdAt: addDays(new Date(), 4),
    }),
  ]);
}
describe('Product Repository', () => {
  it('throws error when fetching non-existing product', async () => {
    await expect(getById('cbce2aef-6da9-4d4a-8b1a-87c20e6b738b')).rejects.toThrow('Product not found');
  });

  it('fetches product by id', async () => {
    const product = await productFactory.create();
    const freshProduct = await getById(product.id);
    expect(freshProduct).not.toBeNull();
    expect(freshProduct?.id).toEqual(product.id);
    await Product.destroy({ where: { id: product.id } });
  });

  it('searches products by their name', async () => {
    await seedProducts();
    const { products, total } = await fetchProducts({ search: 'product' });
    expect(products.length).toEqual(3);
    expect(total).toEqual(3);
  });

  it('filters products by their color', async () => {
    await seedProducts();
    const { products, total } = await fetchProducts({ filter: 'color:red' });
    expect(products.length).toEqual(2);
    expect(total).toEqual(2);
  });

  it('filters products by multiple attributes', async () => {
    await seedProducts();
    const { products, total } = await fetchProducts({ filter: 'color:red,branch:luxury' });
    expect(products.length).toEqual(1);
    expect(total).toEqual(1);
  });

  it('sorts products by createdAt in descending order', async () => {
    await seedProducts();
    const { products, total } = await fetchProducts({ sortBy: 'createdAt:desc' });
    expect(products.length).toEqual(3);
    expect(total).toEqual(3);
    expect(products[0]?.name).toEqual('Awful Product');
  });

  it('sorts products by createdAt in ascending order', async () => {
    await seedProducts();
    const { products, total } = await fetchProducts({ sortBy: 'createdAt:asc' });
    expect(products.length).toEqual(3);
    expect(total).toEqual(3);
    expect(products[0]?.name).toEqual('Elegant Product');
  });

  it('searches and filters products', async () => {
    await seedProducts();
    const { products, total } = await fetchProducts({
      search: 'product',
      filter: 'color:red',
      sortBy: 'createdAt:desc',
    });
    expect(products.length).toEqual(2);
    expect(total).toEqual(2);
    expect(products[0]?.name).toEqual('Awesome Product');
  });

  it('paginates the list of products', async () => {
    await seedProducts();
    const { products, total } = await fetchProducts({
      search: 'product',
      limit: '1',
      offset: '0',
    });
    expect(products.length).toEqual(1);
    expect(total).toEqual(3);
  });
});
