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
import { Media, RoomRequest } from "@/models";

/**
 * @interface IRoomReview
 * @description Interface for RoomReview
 */
interface IRoomReview {
  id?: number;
  roomRequestId: number;
  rating: number;
  message: string;
  mediaId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class RoomReview
 * @description RoomReview model
 */

@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class RoomReview extends Model<IRoomReview, Optional<IRoomReview, "id">> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @ForeignKey(() => RoomRequest)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    onDelete: "CASCADE",
  })
  roomRequestId!: number;
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  })
  rating!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message!: string;

  @ForeignKey(() => Media)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
    onDelete: "SET NULL",
  })
  mediaId!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;

  @BelongsTo(() => RoomRequest)
  roomRequest!: RoomRequest;

  @BelongsTo(() => Media)
  media!: Media;
}

export default RoomReview;
