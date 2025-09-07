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

/**
 * @interface IAmenity
 * @description Interface for Amenity
 */
interface IAmenity {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class Amenity
 * @description Amenity model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class Amenity extends Model<IAmenity, Optional<IAmenity, "id">> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  icon!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;
}

export default Amenity;
