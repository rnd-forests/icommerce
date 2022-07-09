import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { dbConnection } from '../config';

class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
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

Order.init(
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
      type: DataTypes.ENUM('new', 'complete'),
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
    sequelize: dbConnection,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
  },
);

export default Order;
