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
import { comparePassword } from "@/utils/passwordUtil";

/**
 * @interface IEmailVerification
 * @description Interface for EmailVerification
 */
interface IEmailVerification {
  id?: number;
  otp: string;
  attempts?: number;
  expiresAt: Date;
  verifiedAt?: Date | null;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class EmailVerification
 * @description EmailVerification model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class EmailVerification extends Model<
  IEmailVerification,
  Optional<IEmailVerification, "id">
> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  otp!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  attempts!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  verifiedAt!: Date;

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

  public async compareOtp(otp: string): Promise<boolean> {
    return await comparePassword({
      encryptedPassword: this.otp,
      password: otp,
    });
  }
}

export default EmailVerification;
