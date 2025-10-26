import { Media, User, UserProfile } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import {
  decodeGetQuery,
  getPagination,
  getPagingData,
} from "@/utils/paginationUtil";
import { Request, Response } from "express";
import { FindAndCountOptions, Op, Order } from "sequelize";

const getByAdmin = async (req: Request, res: Response) => {
  const { page, size, search, sortBy, orderBy } = decodeGetQuery(req.query);
  const { limit, offset } = getPagination({ page, size });
  const { role, isEmailVerified, isEnabled, status } = req.query;

  const whereCondition: any = {};
  const profileWhereCondition: any = {};

  // Filter by role
  if (role) {
    whereCondition.role = role;
  }

  // Filter by email verification status
  if (isEmailVerified !== undefined) {
    whereCondition.isEmailVerified = isEmailVerified === "true";
  }

  // Filter by enabled status
  if (isEnabled !== undefined) {
    whereCondition.isEnabled = isEnabled === "true";
  }

  // Filter by profile status
  if (status) {
    profileWhereCondition.status = status;
  }

  // Search by username, email, or fullName
  if (search) {
    whereCondition[Op.or] = [
      { username: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { fullName: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const orderClause: Order = [];
  if (sortBy) {
    orderClause.push([sortBy, orderBy || "desc"]);
  } else {
    orderClause.push(["createdAt", "desc"]);
  }

  const query: FindAndCountOptions = {
    where: whereCondition,
    limit,
    offset,
    order: orderClause,
    attributes: [
      "id",
      "username",
      "email",
      "fullName",
      "role",
      "isEmailVerified",
      "isEnabled",
      "loginMethod",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: UserProfile,
        attributes: [
          "id",
          "phone",
          "isPhoneVerified",
          "gender",
          "dob",
          "occupationStatus",
          "maritalStatus",
          "status",
          "createdAt",
          "updatedAt",
        ],
        where:
          Object.keys(profileWhereCondition).length > 0
            ? profileWhereCondition
            : undefined,
        include: [
          {
            model: Media,
            as: "avatar",
            attributes: ["id", "fileName", "path", "mimeType", "url"],
          },
          {
            model: Media,
            as: "document",
            attributes: ["id", "fileName", "path", "mimeType", "url"],
          },
        ],
      },
    ],
    distinct: true,
  };

  const paginatedData = await User.findAndCountAll(query);

  const response = getPagingData({
    paginatedData,
    page,
    limit,
  });

  new ApiResponse({
    status: 200,
    message: "Users fetched successfully",
    data: response,
  }).send(res);
};

export default getByAdmin;
