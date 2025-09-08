import { Amenity, RoomAmenity } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import {
  decodeGetQuery,
  getPagination,
  getPagingData,
} from "@/utils/paginationUtil";
import { Request, Response } from "express";
import { FindAndCountOptions, Op, Order } from "sequelize";

const get = async (req: Request, res: Response) => {
  const { page, size, search, sortBy, orderBy } = decodeGetQuery(req.query);
  const { limit, offset } = getPagination({ page, size });
  const room = req.room;
  const whereCondition: any = {};

  whereCondition.roomId = room.id;

  if (search) {
    whereCondition[Op.or] = [
      {
        description: {
          [Op.like]: `%${search}%`,
        },
      },
      {
        "$Amenity.name$": {
          [Op.like]: `%${search}%`,
        },
      },
    ];
  }
  const query: FindAndCountOptions = {
    attributes: ["id", "description", "createdAt", "updatedAt"],
    include: [
      {
        model: Amenity,
      },
    ],
  };

  const orderCondition = [[sortBy, orderBy]];
  query.where = whereCondition;
  query.order = orderCondition as Order;
  query.limit = limit;
  query.offset = offset;

  const paginatedData = await RoomAmenity.findAndCountAll(query);

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

export default get;
