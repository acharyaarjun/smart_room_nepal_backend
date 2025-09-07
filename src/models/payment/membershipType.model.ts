/**
 * @interface IMembershipType
 * @description Interface for MembershipType
 */

import { Optional } from "sequelize";
import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

interface IMembershipType {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  limit: number;
  price: number;
  features?: string;
}

/**
 * @class MembershipType
 * @description MembershipType model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class MembershipType extends Model<
  IMembershipType,
  Optional<IMembershipType, "id">
> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  slug!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  limit!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  })
  price!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  features!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;
}

export default MembershipType;
