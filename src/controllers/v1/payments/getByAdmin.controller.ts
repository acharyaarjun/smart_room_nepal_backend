import { Request, Response } from "express";
import { Payment, MembershipType, User } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import {
  decodeGetQuery,
  getPagination,
  getPagingData,
} from "@/utils/paginationUtil";
import { FindAndCountOptions, Op, Order } from "sequelize";

const getByAdmin = async (req: Request, res: Response) => {
  const { page, size, search, sortBy, orderBy } = decodeGetQuery(req.query);
  const { limit, offset } = getPagination({ page, size });
  const { status, userId, membershipTypeId, paymentMethod } = req.query;

  const whereCondition: any = {};

  // Filter by payment status
  if (status) {
    whereCondition.status = status;
  }

  // Filter by userId
  if (userId) {
    whereCondition.userId = userId;
  }

  // Filter by membershipTypeId
  if (membershipTypeId) {
    whereCondition.membershipTypeId = membershipTypeId;
  }

  // Filter by payment method
  if (paymentMethod) {
    whereCondition.paymentMethod = paymentMethod;
  }

  // Search by transaction ID
  if (search) {
    whereCondition.transactionId = { [Op.iLike]: `%${search}%` };
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
    include: [
      {
        model: MembershipType,
        attributes: [
          "id",
          "name",
          "slug",
          "description",
          "price",
          "limit",
          "features",
        ],
      },
      {
        model: User,
        attributes: ["id", "username", "email", "fullName", "role"],
      },
    ],
    attributes: [
      "id",
      "userId",
      "membershipTypeId",
      "amount",
      "paymentDate",
      "expiryDate",
      "transactionId",
      "status",
      "paymentMethod",
      "remarks",
      "createdAt",
      "updatedAt",
    ],
    distinct: true,
  };

  const paginatedData = await Payment.findAndCountAll(query);

  const response = getPagingData({
    paginatedData,
    page,
    limit,
  });

  new ApiResponse({
    status: 200,
    message: "Payments fetched successfully",
    data: response,
  }).send(res);
};

export default getByAdmin;
