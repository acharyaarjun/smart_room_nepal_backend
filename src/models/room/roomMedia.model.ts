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
import { Media, Room } from "@/models";

/**
 * @interface IRoomMedia
 * @description Interface for RoomMedia
 */
interface IRoomMedia {
  id?: number;
  roomId: number;
  mediaId: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class RoomMedia
 * @description RoomMedia model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class RoomMedia extends Model<IRoomMedia, Optional<IRoomMedia, "id">> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    onDelete: "CASCADE",
  })
  roomId!: number;

  @ForeignKey(() => Media)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    onDelete: "CASCADE",
  })
  mediaId!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;

  @BelongsTo(() => Room)
  room!: Room;

  @BelongsTo(() => Media)
  media!: Media;
}

export default RoomMedia;
