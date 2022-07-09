declare namespace T {
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
    interface CustomerCreationAttributes {
      firstName: string;
      lastName: string;
      phone: string;
    }
  }

  namespace Order {
    interface OrderItem {
      id: string;
      quantity: number;
    }

    interface OrderCreationAttributes {
      customer: Customer.CustomerCreationAttributes;
      items: OrderItem[];
    }
  }
}
