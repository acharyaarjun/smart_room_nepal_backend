import { Request, Response } from "express";
import { Payment, MembershipType, User } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import {
  decodeGetQuery,
  getPagination,
  getPagingData,
} from "@/utils/paginationUtil";
import { FindAndCountOptions, Order } from "sequelize";

const getMyPayments = async (req: Request, res: Response) => {
  const { page, size, sortBy, orderBy } = decodeGetQuery(req.query);
  const { limit, offset } = getPagination({ page, size });
  const user: User = req.user!;

  const orderClause: Order = [];
  if (sortBy) {
    orderClause.push([sortBy, orderBy || "desc"]);
  } else {
    orderClause.push(["createdAt", "desc"]);
  }

  const query: FindAndCountOptions = {
    where: {
      userId: user.id,
    },
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
    ],
    attributes: [
      "id",
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
    message: "Payment history fetched successfully",
    data: response,
  }).send(res);
};

export default getMyPayments;
