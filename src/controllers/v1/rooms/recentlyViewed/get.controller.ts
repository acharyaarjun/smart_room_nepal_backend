import { RecentlyViewed, Room, District, Media } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import {
  decodeGetQuery,
  getPagination,
  getPagingData,
} from "@/utils/paginationUtil";
import { Request, Response } from "express";
import { FindAndCountOptions, Order } from "sequelize";

const get = async (req: Request, res: Response) => {
  const { page, size, sortBy, orderBy } = decodeGetQuery(req.query);
  const { limit, offset } = getPagination({ page, size });
  const user = req.user;

  const orderClause: Order = [];
  if (sortBy) {
    orderClause.push([sortBy, orderBy || "asc"]);
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
        model: Room,
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
      },
    ],
    distinct: true,
  };

  const paginatedData = await RecentlyViewed.findAndCountAll(query);

  const response = getPagingData({
    paginatedData,
    page,
    limit,
  });

  new ApiResponse({
    status: 200,
    message: "Recently viewed rooms fetched successfully",
    data: response,
  }).send(res);
};

export default get;
