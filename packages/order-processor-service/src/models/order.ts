/* eslint-disable no-use-before-define */

import {
  Model,
  Sequelize,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  HasOneCreateAssociationMixin,
  NonAttribute,
  Association,
} from 'sequelize';

import type { OrderItem } from './orderitem';
import type { Transaction } from './transaction';

type OrderAssociations = 'orderItems' | 'transaction';

export const ORDER_STATUSES = {
  NEW: 'new',
  PENDING: 'pending',
  COMPLETE: 'complete',
};

export class Order extends Model<
  InferAttributes<Order, { omit: OrderAssociations }>,
  InferCreationAttributes<Order, { omit: OrderAssociations }>
> {
  declare id: CreationOptional<string>;

  declare customerId: string;

  declare status: string;

  declare total: number;

  declare firstName: string;

  declare lastName: string;

  declare phone: string;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;

  declare orderItems?: NonAttribute<OrderItem[]>;

  declare getOrderItems: HasManyGetAssociationsMixin<OrderItem>;

  declare setOrderItems: HasManySetAssociationsMixin<OrderItem, number>;

  declare addOrderItem: HasManyAddAssociationMixin<OrderItem, number>;

  declare addOrderItems: HasManyAddAssociationsMixin<OrderItem, number>;

  declare createOrderItem: HasManyCreateAssociationMixin<OrderItem>;

  declare removeOrderItem: HasManyRemoveAssociationMixin<OrderItem, number>;

  declare removeOrderItems: HasManyRemoveAssociationsMixin<OrderItem, number>;

  declare hasOrderItem: HasManyHasAssociationMixin<OrderItem, number>;

  declare hasOrderItems: HasManyHasAssociationsMixin<OrderItem, number>;

  declare countOrderItems: HasManyCountAssociationsMixin;

  declare transaction?: NonAttribute<Transaction>;

  declare getTransaction: HasOneGetAssociationMixin<Transaction>;

  declare setTransaction: HasOneSetAssociationMixin<Transaction, number>;

  declare createTransaction: HasOneCreateAssociationMixin<Transaction>;

  declare static associations: {
    orderItems: Association<Order, OrderItem>;
    transaction: Association<Order, Transaction>;
  };
}

export const defineOrder = (sequelize: Sequelize, model: typeof Order) => {
  model.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        // For simplicity, the order has only two statuses here.
        type: DataTypes.ENUM('new', 'pending', 'complete'),
        allowNull: false,
      },
      total: {
        // As we don't have tax or shipping fee or promotion, we just define
        // only order total here for simplicity.
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      timestamps: true,
    },
  );
};
