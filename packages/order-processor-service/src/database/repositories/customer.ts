import got from 'got';
import config from 'config';

export const fetchCustomer = async (
  attributes: T.Customer.CustomerCreationAttributes,
): Promise<T.Customer.CustomerSchema | null> => {
  const customerServiceEndpoint = config.get<string>('customerService.endpoint');
  const customerServiceApiKey = config.get<string>('customerService.apiKey');

  const response = await got
    .post(`${customerServiceEndpoint}/v1/customers`, {
      json: attributes,
      responseType: 'json',
      headers: { 'Authorization-Server': customerServiceApiKey },
    })
    .json<T.Customer.CustomerSchema | T.API.ErrorResponse>();

  if ('id' in response) {
    return response;
  }

  return null;
};
