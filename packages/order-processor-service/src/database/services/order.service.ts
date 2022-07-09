import * as yup from 'yup';
import Order from '../../models/order';
import * as orderRepository from '../repositories/order';

export const createOrder = async (attributes: T.Order.OrderCreationAttributes): Promise<Order> => {
  const schema = yup.object().shape({
    customer: yup
      .object()
      .shape({ firstName: yup.string().required(), lastName: yup.string().required(), phone: yup.string().required() }),
    items: yup.array().of(yup.object().shape({ id: yup.string().required(), quantity: yup.number().required() })),
  });

  if (!(await schema.isValid(attributes))) {
    throw new Error('Invalid order creation attributes');
  }

  return orderRepository.createOrder(attributes);
};
