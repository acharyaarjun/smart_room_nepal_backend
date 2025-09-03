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
import { User } from "@/models";
import { Optional } from "sequelize";

/**
 * @interface IRefreshToken
 * @description Interface for RefreshToken
 */
interface IRefreshToken {
  id?: number;
  token: string;
  expiresAt: Date;
  revokedAt?: Date;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class RefreshToken
 * @description RefreshToken model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class RefreshToken extends Model<IRefreshToken, Optional<IRefreshToken, "id">> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  token!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  revokedAt!: Date;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;
}

export default RefreshToken;
