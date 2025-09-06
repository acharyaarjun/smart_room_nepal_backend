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
import { Gender, MaritalStatus, OccupationStatus, UserStatus } from "@/enums";
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
  occupationStatus?: OccupationStatus;
  maritalStatus?: MaritalStatus;
  status?: UserStatus;
  avatarId?: number;
  documentId?: number;
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  userId!: number;

  @ForeignKey(() => Media)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
    onDelete: "SET NULL",
  })
  avatarId!: number;

  @ForeignKey(() => Media)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
    onDelete: "SET NULL",
  })
  documentId!: number;

  @Column({
    type: DataType.ENUM(...Object.values(OccupationStatus)),
    allowNull: true,
  })
  occupationStatus!: OccupationStatus;

  @Column({
    type: DataType.ENUM(...Object.values(MaritalStatus)),
    allowNull: true,
  })
  maritalStatus!: MaritalStatus;

  @Column({
    type: DataType.ENUM(...Object.values(UserStatus)),
    allowNull: false,
    defaultValue: UserStatus.PENDING,
  })
  status!: UserStatus;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Media, { foreignKey: "avatarId", as: "avatar" })
  avatar!: Media;

  @BelongsTo(() => Media, { foreignKey: "documentId", as: "document" })
  document!: Media;
}

export default UserProfile;
