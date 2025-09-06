import { Optional } from "sequelize";
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Media } from "@/models";

/**
 * @interface IDistrict
 * @description Interface for District
 */
interface IDistrict {
  id?: number;
  name: string;
  description: string;
  imageId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class District
 * @description District model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class District extends Model<IDistrict, Optional<IDistrict, "id">> {
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

  @ForeignKey(() => Media)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
    onDelete: "SET NULL",
  })
  imageId!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;

  @BelongsTo(() => Media)
  image!: Media;
}

export default District;
