import { CloudEvent } from 'cloudevents';
import { Sequelize, InferAttributes } from 'sequelize';
import { Product as ProductModel } from '@icommerce/warehouse-service/src/models';
import { Customer as CustomerModel } from '@icommerce/customer-service/src/models';
import { Order as OrderModel, OrderItem as OrderItemModel } from '@icommerce/order-processor-service/src/models';

declare global {
  const jestSequelize: Sequelize;

  namespace T {
    interface ObjectAny {
      [key: string]: any;
    }

    namespace Product {
      interface ProductSchema extends InferAttributes<ProductModel> {}

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
      interface GenericEvent extends CloudEvent<E> {}

      interface OrderPlacedEventData extends Order.OrderSchema {
        orderItems: Order.OrderItemSchema[];
      }

      interface OrderPlacedEvent extends CloudEvent<OrderPlacedEventData> {}

      interface UserPlacedOrderEvent extends OrderPlacedEvent {}

      interface UserViewedProductEvent extends CloudEvent<T.Product.ProductSchema> {}

      interface UserSearchFilterProductsEventData {
        query: T.ObjectAny;
        matchedProductIds: string[];
      }

      interface UserSearchFilterProductsEvent extends CloudEvent<UserSearchFilterProductsEventData> {}

      interface StockReservedEventData {
        orderId: string;
      }

      interface StockReservedEvent extends CloudEvent<StockReservedEventData> {}

      interface StockReservedErrorEventData {
        orderId: string;
      }

      interface StockReservedErrorEvent extends CloudEvent<StockReservedErrorEventData> {}
    }

    namespace ActivityLog {
      interface UserActivityLogSchema {
        type: string;
        userId: string;
        payload:
          | T.Events.UserPlacedOrderEvent
          | T.Events.UserViewedProductEvent
          | T.Events.UserSearchFilterProductsEvent;
      }
    }
  }
}
