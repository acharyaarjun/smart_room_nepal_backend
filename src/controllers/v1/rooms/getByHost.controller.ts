import { District, Media, Room } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import {
  decodeGetQuery,
  getPagination,
  getPagingData,
} from "@/utils/paginationUtil";
import { Request, Response } from "express";
import { FindAndCountOptions, Op, Order } from "sequelize";

const getByHost = async (req: Request, res: Response) => {
  const { page, size, search, sortBy, orderBy } = decodeGetQuery(req.query);
  const { limit, offset } = getPagination({ page, size });
  const { isFeatured, minPrice, maxPrice, roomType, maxCapacity, roomStatus } =
    req.query;
  const district = req.district;

  const whereCondition: any = {};

  whereCondition.userId = req.user?.id;

  if (roomStatus) {
    whereCondition.roomStatus = roomStatus;
  }

  if (district) {
    whereCondition.districtId = district.id;
  }

  if (isFeatured !== undefined) {
    whereCondition.isFeatured = isFeatured === "true";
  }

  if (minPrice) {
    whereCondition.price = { [Op.gte]: Number(minPrice) };
  }

  if (maxPrice) {
    whereCondition.price = {
      ...whereCondition.price,
      [Op.lte]: Number(maxPrice),
    };
  }

  if (roomType) {
    whereCondition.roomType = roomType;
  }

  if (maxCapacity) {
    whereCondition.maxCapacity = maxCapacity;
  }

  if (search) {
    whereCondition[Op.or] = [
      {
        name: {
          [Op.like]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.like]: `%${search}%`,
        },
      },
    ];
  }
  const query: FindAndCountOptions = {
    attributes: [
      "id",
      "name",
      "slug",
      "shortDescription",
      "description",
      "price",
      "unit",
      "offerPrice",
      "longitude",
      "latitude",
      "address",
      "roomType",
      "maxCapacity",
      "roomStatus",
      "createdAt",
      "isFeatured",
      "updatedAt",
    ],
    include: [
      {
        model: District,
        attributes: ["id", "name", "slug", "description"],
      },
      {
        model: Media,
        attributes: ["fileName", "path", "mimeType", "url"],
      },
    ],
  };

  const orderCondition = [[sortBy, orderBy]];
  query.where = whereCondition;
  query.order = orderCondition as Order;
  query.limit = limit;
  query.offset = offset;

  const paginatedData = await Room.findAndCountAll(query);

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
export default getByHost;
