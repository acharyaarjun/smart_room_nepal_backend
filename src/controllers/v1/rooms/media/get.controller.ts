import { Media, RoomMedia } from "@/models";
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
  const room = req.room;
  const whereCondition: any = {};

  whereCondition.roomId = room.id;

  const query: FindAndCountOptions = {
    attributes: ["id", "createdAt", "updatedAt"],
    include: [
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

  const paginatedData = await RoomMedia.findAndCountAll(query);

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
