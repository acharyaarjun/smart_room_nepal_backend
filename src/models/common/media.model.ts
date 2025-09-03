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
import { generateFileUrl } from "@/utils/fileStorageUtil";
import { Optional } from "sequelize";

/**
 * @interface IMedia
 * @description Interface for Media
 */
interface IMedia {
  id?: number;
  path: string;
  fileName: string;
  mimeType: string;
  size: number;
  isPrivate?: boolean;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * @class Media
 * @description Media model
 */
@Table({
  timestamps: true,
  paranoid: true,
  underscored: true,
})
class Media extends Model<IMedia, Optional<IMedia, "id">> {
  @Column({ autoIncrement: true, primaryKey: true, type: DataType.BIGINT })
  public id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  path!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fileName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  mimeType!: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  size!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isPrivate!: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Media): string {
      return generateFileUrl({
        directory: this.path,
        fileName: this.fileName,
      });
    },
  })
  url?: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;
}

export default Media;
