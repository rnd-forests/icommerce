import { CloudEvent } from 'cloudevents';
import { InferAttributes } from 'sequelize';
import { Customer as CustomerModel } from '@icommerce/customer-service/src/models';
import { Order as OrderModel, OrderItem as OrderItemModel } from '@icommerce/order-processor-service/src/models';

declare global {
  namespace T {
    namespace Product {
      interface FetchProductsFilters {
        search?: string; // search products by their name
        filter?: string; // filter products by their attributes. The format should be: attr1:value,attr2:value
        sortBy?: string; // sort products by their attributes. The format should be: attr1:asc|desc,attr2:asc|desc
        limit?: string; // limit the string of products returned
        offset?: string; // offset the results by a certain number of products
      }
    }

    namespace Customer {
      interface CustomerSchema extends InferAttributes<CustomerModel> {}

      interface CustomerCreationAttributes {
        firstName: string;
        lastName: string;
        phone: string;
      }
    }

    namespace Order {
      interface OrderItem {
        id: string;
        price: number;
        quantity: number;
      }

      interface OrderCreationAttributes {
        customer: Customer.CustomerCreationAttributes;
        items: OrderItem[];
      }

      interface OrderSchema extends InferAttributes<OrderModel> {}

      interface OrderItemSchema extends InferAttributes<OrderItemModel> {}
    }

    namespace API {
      interface ErrorResponse {
        message: string;
      }
    }

    namespace Events {
      interface OrderPlacedEventData extends Order.OrderSchema {
        orderItems: Order.OrderItemSchema[];
      }
      interface OrderPlacedEvent extends CloudEvent<OrderPlacedEventData> {}
    }
  }
}
