/* eslint-disable no-use-before-define */

import {
  Model,
  Sequelize,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Association,
  NonAttribute,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from 'sequelize';

import type { Order } from './order';

type OrderItemAssociations = 'order';

export class OrderItem extends Model<
  InferAttributes<OrderItem, { omit: OrderItemAssociations }>,
  InferCreationAttributes<OrderItem, { omit: OrderItemAssociations }>
> {
  declare id: CreationOptional<string>;

  declare orderId: string;

  declare itemId: string;

  declare price: number;

  declare quantity: number;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;

  declare order?: NonAttribute<Order>;

  declare getOrder: BelongsToGetAssociationMixin<Order>;

  declare setOrder: BelongsToSetAssociationMixin<Order, number>;

  declare createOrder: BelongsToCreateAssociationMixin<Order>;

  declare static associations: {
    order: Association<OrderItem, Order>;
  };
}

export const defineOrderItem = (sequelize: Sequelize, model: typeof OrderItem) => {
  model.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      itemId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
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
      modelName: 'OrderItem',
      tableName: 'order_items',
      timestamps: true,
    },
  );
};
