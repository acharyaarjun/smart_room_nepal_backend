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
import { User, Media } from "@/models";
import { Gender } from "@/enums";
import { Optional } from "sequelize";

/**
 * @interface IUserProfile
 * @description Interface for UserProfile
 */
interface IUserProfile {
  id?: number;
  phone?: string;
  isPhoneVerified?: boolean;
  gender?: Gender;
  dob?: Date;
  userId?: number;
  avatarId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class UserProfile
 * @description UserProfile model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class UserProfile extends Model<IUserProfile, Optional<IUserProfile, "id">> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @Column({
    type: DataType.STRING(15),
    allowNull: true,
  })
  phone!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  isPhoneVerified!: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(Gender)),
    allowNull: true,
  })
  gender!: Gender;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  dob!: Date;

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
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Media)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
    onDelete: "SET NULL",
  })
  avatarId!: number;

  @BelongsTo(() => Media)
  avatar!: Media;
}

export default UserProfile;
