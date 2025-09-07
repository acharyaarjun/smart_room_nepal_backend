import { Amenity } from "@/models";
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
  const whereCondition: any = {};

  if (search) {
    whereCondition[Op.or] = [
      {
        name: {
          [Op.like]: `%${search}%`,
        },
      },
      {
        icon: {
          [Op.like]: `%${search}%`,
        },
      },
    ];
  }
  const query: FindAndCountOptions = {
    attributes: ["id", "name", "icon", "createdAt", "updatedAt"],
  };

  const orderCondition = [[sortBy, orderBy]];
  query.where = whereCondition;
  query.order = orderCondition as Order;
  query.limit = limit;
  query.offset = offset;

  const paginatedData = await Amenity.findAndCountAll(query);

  const response = getPagingData({
    paginatedData,
    page,
    limit,
  });

  new ApiResponse({
    status: 200,
    message: "Fetched successfully",
    data: response,
  }).send(res);
};

export default getByAdmin;
