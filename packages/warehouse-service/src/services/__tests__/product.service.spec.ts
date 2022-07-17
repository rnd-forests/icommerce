import { getById, getAll, reserveProductStocks } from '../product.service';

const mockRepositoryGetById = jest.fn();
const mockRepositoryFetchProducts = jest.fn();
const mockReserveProductStocksTransacting = jest.fn();
jest.mock('../../database/repositories/product', () => ({
  getById: (...args: any) => mockRepositoryGetById(...args),
  fetchProducts: (...args: any) => mockRepositoryFetchProducts(...args),
  reserveProductStocks: jest.fn(),
  reserveProductStocksTransacting: (...args: any) => mockReserveProductStocksTransacting(...args),
}));

describe('ProductService', () => {
  it('fetches product by id', async () => {
    const productId = '1c3b64ac-6d6c-4e5a-b7fd-50cad160f011';
    await getById(productId);
    expect(mockRepositoryGetById).toHaveBeenCalledTimes(1);
    expect(mockRepositoryGetById).toHaveBeenCalledWith(productId);
  });

  it('fetches product list with fitler', async () => {
    await getAll({ search: 'foo' });
    expect(mockRepositoryFetchProducts).toHaveBeenCalledTimes(1);
    expect(mockRepositoryFetchProducts).toHaveBeenCalledWith({ search: 'foo' });
  });

  it('reserves product stocks', async () => {
    await reserveProductStocks([
      {
        id: '3394a4bb-db11-457b-9c6b-95e17efbc27c',
        orderId: '25f0d785-d814-481b-95c1-d9c68941f992',
        itemId: 'bc98c3d1-c8a2-44aa-992f-834c7137722d',
        price: 2.99,
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    expect(mockReserveProductStocksTransacting).toHaveBeenCalledTimes(1);
  });
});
