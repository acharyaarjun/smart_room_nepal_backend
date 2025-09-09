import { RoomRequestStatus } from "@/enums";
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
import { User, Room } from "@/models";

/**
 * @interface IRoomRequest
 * @description Interface for RoomRequest
 */
interface IRoomRequest {
  id?: number;
  token: string;
  userId: number;
  roomId: number;
  isFixedDate: boolean;
  startDate?: Date;
  endDate?: Date;
  status?: RoomRequestStatus;
  price?: number;
  acceptedPrice?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class RoomRequest
 * @description RoomRequest model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class RoomRequest extends Model<IRoomRequest, Optional<IRoomRequest, "id">> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  token!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    onDelete: "CASCADE",
  })
  userId!: number;

  @ForeignKey(() => Room)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    onDelete: "CASCADE",
  })
  roomId!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isFixedDate!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  startDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  endDate!: Date;

  @Column({
    type: DataType.ENUM(...Object.values(RoomRequestStatus)),
    allowNull: false,
    defaultValue: RoomRequestStatus.PENDING,
  })
  status!: RoomRequestStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  price!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  acceptedPrice!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Room)
  room!: Room;
}

export default RoomRequest;
