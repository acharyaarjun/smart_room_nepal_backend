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
import { Room, User } from "@/models";
/**
 * @interface IRecentlyViewed
 * @description Interface for RecentlyViewed
 */
interface IRecentlyViewed {
  id?: number;
  userId: number;
  roomId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * @class RecentlyViewed
 * @description RecentlyViewed model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class RecentlyViewed extends Model<
  IRecentlyViewed,
  Optional<IRecentlyViewed, "id">
> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

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

export default RecentlyViewed;
