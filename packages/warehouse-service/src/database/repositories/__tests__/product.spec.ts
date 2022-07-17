import { addDays } from 'date-fns';
import { Product } from '../../../models';
import { productFactory } from '../../../test';
import { getById, fetchProducts, reserveProductStocks } from '../product';

async function seedProducts() {
  return Promise.all([
    productFactory.create({
      name: 'Elegant Product',
      color: 'red',
      branch: 'luxury',
      sku: 5,
      createdAt: new Date(),
    }),

    productFactory.create({
      name: 'Awesome Product',
      color: 'red',
      branch: 'super luxury',
      sku: 10,
      createdAt: addDays(new Date(), 2),
    }),

    productFactory.create({
      name: 'Awful Product',
      color: 'green',
      branch: 'normal',
      sku: 15,
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

  it('reserves product stocks', async () => {
    const [p1, p2] = await seedProducts();
    const reserved = await reserveProductStocks([
      {
        id: '3394a4bb-db11-457b-9c6b-95e17efbc27c',
        orderId: '25f0d785-d814-481b-95c1-d9c68941f992',
        itemId: p1.id,
        price: 2.99,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        id: '3394a4bb-db11-457b-9c6b-95e17efbc27c',
        orderId: '25f0d785-d814-481b-95c1-d9c68941f992',
        itemId: p2.id,
        price: 3.99,
        quantity: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    expect(reserved).toBe(true);

    const freshP1 = await Product.findByPk(p1.id);
    expect(freshP1?.sku).toEqual(p1.sku - 2);

    const freshP2 = await Product.findByPk(p2.id);
    expect(freshP2?.sku).toEqual(p2.sku - 3);
  });

  it('should not reserve stocks if products are not available', async () => {
    await seedProducts();
    const reserved = await reserveProductStocks([
      {
        id: '3394a4bb-db11-457b-9c6b-95e17efbc27c',
        orderId: '25f0d785-d814-481b-95c1-d9c68941f992',
        itemId: 'bc98c3d1-c8a2-44aa-992f-834c7137722d', // random product ID
        price: 2.99,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    expect(reserved).toBe(false);
  });

  it('should not reserve stocks if item quanity exceeded product SKU', async () => {
    const [p1, p2] = await seedProducts();
    const reserved = await reserveProductStocks([
      {
        id: '3394a4bb-db11-457b-9c6b-95e17efbc27c',
        orderId: '25f0d785-d814-481b-95c1-d9c68941f992',
        itemId: p1.id,
        price: 2.99,
        quantity: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        id: '3394a4bb-db11-457b-9c6b-95e17efbc27c',
        orderId: '25f0d785-d814-481b-95c1-d9c68941f992',
        itemId: p2.id,
        price: 3.99,
        quantity: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    expect(reserved).toBe(false);
  });
});
