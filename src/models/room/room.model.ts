import { MaxCapacity, RoomStatus, RoomType } from "@/enums";
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
import { District, User } from "@/models";
import { Optional } from "sequelize";

/**
 * @interface IRoom
 * @description Interface for Room
 */
interface IRoom {
  id?: number;
  userId: number;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  offerPrice?: number;
  districtId: number;
  longitude?: number;
  latitude?: number;
  address?: string;
  roomType: RoomType;
  maxCapacity: MaxCapacity;
  roomStatus?: RoomStatus;
  isFeatured?: boolean;
}

/**
 * @class Room
 * @description Room model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class Room extends Model<IRoom, Optional<IRoom, "id">> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  userId!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  shortDescription!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  offerPrice!: number;

  @ForeignKey(() => District)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  districtId!: number;

  @Column({
    type: DataType.DECIMAL(10, 7),
    allowNull: true,
  })
  longitude!: number;

  @Column({
    type: DataType.DECIMAL(10, 7),
    allowNull: true,
  })
  latitude!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  address!: string;

  @Column({
    type: DataType.ENUM(...Object.values(RoomType)),
    allowNull: false,
  })
  roomType!: RoomType;

  @Column({
    type: DataType.ENUM(...Object.values(MaxCapacity)),
    allowNull: false,
  })
  maxCapacity!: MaxCapacity;

  @Column({
    type: DataType.ENUM(...Object.values(RoomStatus)),
    allowNull: false,
  })
  roomStatus!: RoomStatus;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isFeatured!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => District)
  district!: District;
}

export default Room;
