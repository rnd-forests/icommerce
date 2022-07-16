import * as yup from 'yup';
import { Order } from '../models';
import * as orderRepository from '../database/repositories/order';

export const createOrder = async (
  attributes: T.Order.OrderCreationAttributes,
  jwtServer?: string,
): Promise<Order | null> => {
  const schema = yup.object().shape({
    customer: yup
      .object()
      .shape({ firstName: yup.string().required(), lastName: yup.string().required(), phone: yup.string().required() }),
    items: yup
      .array()
      .of(
        yup
          .object()
          .shape({ id: yup.string().required(), price: yup.number().required(), quantity: yup.number().required() }),
      ),
  });

  if (!(await schema.isValid(attributes))) {
    throw new Error('Invalid order creation attributes');
  }

  return orderRepository.createOrder(attributes, jwtServer);
};
