import { MessageSender } from "@/enums";
import { Optional } from "sequelize";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import {
  BelongsTo,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  UpdatedAt,
} from "sequelize-typescript";
import { RoomRequest } from "@/models";

/**
 * @interface IRoomRequestConversation
 * @description Interface for RoomRequestConversation
 */
interface IRoomRequestConversation {
  id?: number;
  roomRequestId: number;
  sender: MessageSender;
  isRead: boolean;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class RoomRequestConversation
 * @description RoomRequestConversation model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class RoomRequestConversation extends Model<
  IRoomRequestConversation,
  Optional<IRoomRequestConversation, "id">
> {
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
    type: DataType.ENUM(...Object.values(MessageSender)),
    allowNull: false,
  })
  sender!: MessageSender;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isRead!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;

  @BelongsTo(() => RoomRequest)
  roomRequest!: RoomRequest;
}

export default RoomRequestConversation;
