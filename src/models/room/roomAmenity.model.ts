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
import { Amenity, Room } from "@/models";

/**
 * @interface IRoomAmenity
 * @description Interface for RoomAmenity
 */
interface IRoomAmenity {
  id?: number;
  roomId: number;
  amenityId: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class RoomAmenity
 * @description RoomAmenity model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class RoomAmenity extends Model<IRoomAmenity, Optional<IRoomAmenity, "id">> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    onDelete: "CASCADE",
  })
  roomId!: number;

  @ForeignKey(() => Amenity)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    onDelete: "CASCADE",
  })
  amenityId!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;

  @BelongsTo(() => Room)
  room!: Room;

  @BelongsTo(() => Amenity)
  amenity!: Amenity;
}

export default RoomAmenity;
