import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { dbConnection } from '../config';
import Order from './order';

class Transaction extends Model<InferAttributes<Transaction>, InferCreationAttributes<Transaction>> {
  declare id: CreationOptional<string>;

  declare customerId: string;

  declare orderId: string;

  declare type: string;

  declare status: string;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

Transaction.init(
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
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Order,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('general', 'refund'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'success'),
      defaultValue: 'new',
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
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
  },
);

export default Transaction;
