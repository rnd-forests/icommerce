import { Model, Sequelize, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export const ORDER_STATUSES = {
  NEW: 'new',
  PENDING: 'pending',
  COMPLETE: 'complete',
};

export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  declare id: CreationOptional<string>;

  declare customerId: string;

  declare status: string;

  declare total: number;

  declare firstName: string;

  declare lastName: string;

  declare phone: string;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
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
