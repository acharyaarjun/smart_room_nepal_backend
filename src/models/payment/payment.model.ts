import { PaymentMethod, PaymentStatus } from "@/enums";
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
import { MembershipType, User } from "@/models";
import { Optional } from "sequelize";

/**
 * @interface IPayment
 * @description Interface for Payment
 */
interface IPayment {
  id?: number;
  userId?: number;
  membershipTypeId?: number;
  amount?: number;
  paymentDate?: Date;
  expiryDate?: Date;
  transactionId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class Payment
 * @description Payment model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class Payment extends Model<IPayment, Optional<IPayment, "id">> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  userId!: number;

  @ForeignKey(() => MembershipType)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  membershipTypeId!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  paymentDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiryDate!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  transactionId!: string;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    allowNull: false,
    defaultValue: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentMethod)),
    allowNull: false,
  })
  paymentMethod!: PaymentMethod;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  remarks!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => MembershipType)
  membershipType!: MembershipType;
}

export default Payment;
