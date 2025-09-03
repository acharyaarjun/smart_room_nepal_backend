import {
  AfterBulkCreate,
  AfterCreate,
  BeforeSave,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  HasOne,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { LoginMethod, Role } from "@/enums";
import { UserProfile } from "@/models";
import { Optional } from "sequelize";
import { comparePassword, hashPassword } from "@/utils/passwordUtil";
import { RefreshToken } from "@/models";
import { generateAccessToken, generateRefreshToken } from "@/utils/jwtUtil";
import { getDateAfterMinutes } from "@/helpers/helper";
import env from "@/utils/validateEnv";

/**
 * @interface IUser
 * @description Interface for User
 */
interface IUser {
  id?: number;
  username: string;
  email: string;
  role: Role;
  fullName: string;
  password: string;
  isEmailVerified?: boolean;
  isEnabled?: boolean;
  loginMethod?: LoginMethod;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class User
 * @description User model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class User extends Model<IUser, Optional<IUser, "id">> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @Column({
    type: DataType.ENUM(...Object.values(Role)),
    allowNull: false,
    defaultValue: Role.USER,
  })
  role!: Role;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    unique: true,
  })
  username!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fullName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isEmailVerified!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isEnabled!: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(LoginMethod)),
    defaultValue: LoginMethod.EMAIL,
  })
  loginMethod!: LoginMethod;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;

  @HasOne(() => UserProfile)
  userProfile!: UserProfile;

  @BeforeSave
  static async hashPassword(user: User) {
    if (user.changed("password")) {
      user.password = await hashPassword(user.password);
    }
  }

  @AfterCreate
  static async createUserProfile(user: User) {
    await UserProfile.create({ userId: user.id });
  }

  @AfterBulkCreate
  static async createUserProfiles(users: readonly User[]) {
    for (const user of users) {
      await UserProfile.create({ userId: user.id });
    }
  }

  public async isPasswordCorrect(candidatePassword: string): Promise<boolean> {
    return await comparePassword({
      password: candidatePassword,
      encryptedPassword: this.password,
    });
  }

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return await comparePassword({
      password: candidatePassword,
      encryptedPassword: this.password,
    });
  }

  public async generateRefreshToken(): Promise<RefreshToken> {
    const token = generateRefreshToken({
      userId: this.id.toString(),
    });

    const createdToken = await RefreshToken.create({
      token: token,
      userId: this.id,
      expiresAt: getDateAfterMinutes(env.JWT_REFRESH_EXPIRES_IN),
    });

    return createdToken;
  }

  public async generateAccessToken(refreshTokenId: string): Promise<string> {
    return generateAccessToken({
      userId: this.id.toString(),
      role: this.role,
      refreshTokenId: refreshTokenId,
    });
  }
}

export default User;
