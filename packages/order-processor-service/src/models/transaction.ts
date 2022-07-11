import { Model, Sequelize, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export const TRANSACTION_STATUSES = {
  NEW: 'new',
  PENDING: 'pending',
  SUCCESS: 'success',
};

export const TRANSACTION_TYPES = {
  GENERAL: 'general',
  REFUND: 'refund',
};

export class Transaction extends Model<InferAttributes<Transaction>, InferCreationAttributes<Transaction>> {
  declare id: CreationOptional<string>;

  declare customerId: string;

  declare orderId: string;

  declare type: string;

  declare status: string;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

export const defineTransaction = (sequelize: Sequelize, model: typeof Transaction) => {
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
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('general', 'refund'),
        defaultValue: 'general',
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('new', 'pending', 'success'),
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
      sequelize,
      modelName: 'Transaction',
      tableName: 'transactions',
      timestamps: true,
    },
  );
};
