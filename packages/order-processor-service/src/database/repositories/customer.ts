import got from 'got';
import config from 'config';

export const fetchCustomer = async (
  attributes: T.Customer.CustomerCreationAttributes,
  jwtServer?: string,
): Promise<T.Customer.CustomerSchema | null> => {
  const customerServiceEndpoint = config.get<string>('customerService.endpoint');

  const response = await got
    .post(`${customerServiceEndpoint}/v1/customers`, {
      json: attributes,
      responseType: 'json',
      headers: { 'Authorization-Server': jwtServer },
      retry: {
        limit: 3,
        maxRetryAfter: 10000,
      },
    })
    .json<T.Customer.CustomerSchema | T.API.ErrorResponse>();

  if ('id' in response) {
    return response;
  }

  return null;
};
