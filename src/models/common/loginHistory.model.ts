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
import { DeviceType } from "@/enums";
import { Optional } from "sequelize";
import { User } from "@/models";

/**
 * @interface ILoginHistory
 * @description Interface for LoginHistory
 */
interface ILoginHistory {
  id?: number;
  deviceType?: DeviceType;
  userAgent?: string;
  ip?: string;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class LoginHistory
 * @description LoginHistory model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class LoginHistory extends Model<ILoginHistory, Optional<ILoginHistory, "id">> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @Column({
    type: DataType.ENUM(...Object.values(DeviceType)),
    allowNull: true,
  })
  deviceType!: DeviceType;

  @Column({
    type: DataType.STRING,
  })
  userAgent!: string;

  @Column({
    type: DataType.STRING(50),
  })
  ip!: string;

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

export default LoginHistory;
