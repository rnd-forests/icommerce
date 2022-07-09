import { middlewareAsync } from '@lib/server';
import { getById, getAll } from '../database/services/product.service';

export const getProductById = middlewareAsync(async (req, res) => {
  const { id } = req.params;
  try {
    return res.json(await getById(id));
  } catch (err) {
    return res.status(404).json({ message: (err as Error).message });
  }
});

export const getProducts = middlewareAsync(async (req, res) => {
  try {
    return res.json(await getAll(req.query));
  } catch (err) {
    return res.status(404).json({ message: (err as Error).message });
  }
});
