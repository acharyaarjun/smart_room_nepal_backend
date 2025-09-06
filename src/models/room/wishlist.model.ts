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
 * @interface IWishlist
 * @description Interface for Wishlist
 */
interface IWishlist {
  id?: number;
  userId: number;
  roomId: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class Wishlist
 * @description Wishlist model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class Wishlist extends Model<IWishlist, Optional<IWishlist, "id">> {
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

export default Wishlist;
