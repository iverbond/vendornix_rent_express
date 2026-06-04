import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ModelStatic,
} from "sequelize";

export const uuidPrimaryKey = {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
};

export type BaseModelAttributes = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ModelDef<T extends Model> = ModelStatic<T>;

export type ModelAttrs<T extends Model> = InferAttributes<T>;
export type ModelCreateAttrs<T extends Model> = InferCreationAttributes<T>;

export type UuidPk = {
  id: CreationOptional<string>;
};
