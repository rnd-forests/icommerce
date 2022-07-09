import { middlewareAsync } from '@lib/server';
import { getById, findOrCreate } from '../database/services/customer.service';

export const getCustomerById = middlewareAsync(async (req, res) => {
  const { id } = req.params;
  try {
    return res.json(await getById(id));
  } catch (err) {
    return res.status(404).json({ message: (err as Error).message });
  }
});

export const createCustomer = middlewareAsync(async (req, res) => {
  try {
    const payload = req.body as T.Customer.CustomerCreationAttributes;
    return res.json(await findOrCreate(payload));
  } catch (err) {
    return res.status(400).json({ message: (err as Error).message });
  }
});
