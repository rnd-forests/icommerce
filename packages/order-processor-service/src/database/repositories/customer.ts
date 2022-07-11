import got from 'got';

export const fetchCustomer = async (
  attributes: T.Customer.CustomerCreationAttributes,
): Promise<T.Customer.CustomerSchema | null> => {
  const customerServiceEndpoint = process.env.CUSTOMER_SERVICE_ENDPOINT || 'http://localhost:3003';
  const customerServiceApiKey = process.env.CUSTOMER_SERVICE_API_KEY || '';

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
