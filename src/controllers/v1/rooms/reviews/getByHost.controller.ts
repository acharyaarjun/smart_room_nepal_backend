import {
  Media,
  Room,
  RoomRequest,
  RoomReview,
  User,
  UserProfile,
} from "@/models";
import ApiResponse from "@/utils/apiResponse";
import {
  decodeGetQuery,
  getPagination,
  getPagingData,
} from "@/utils/paginationUtil";
import { Request, Response } from "express";
import { FindAndCountOptions, Order } from "sequelize";

const getByHost = async (req: Request, res: Response) => {
  const { page, size, sortBy, orderBy } = decodeGetQuery(req.query);
  const { limit, offset } = getPagination({ page, size });
  const { rating, room } = req.query;
  const user = req.user;

  const whereCondition: any = {};

  if (rating) {
    whereCondition.rating = rating;
  }

  if (room) {
    whereCondition["$roomRequest.room.slug$"] = room;
  }

  // Filter reviews for rooms owned by the host
  whereCondition["$roomRequest.room.user_id$"] = user.id;

  const query: FindAndCountOptions = {
    attributes: ["id", "rating", "message", "createdAt", "updatedAt"],
    include: [
      {
        model: Media,
        attributes: ["id", "fileName", "path", "mimeType", "url"],
      },
      {
        model: RoomRequest,
        attributes: ["id", "token", "status"],
        include: [
          {
            model: User,
            attributes: ["id", "username", "fullName"],
            include: [
              {
                model: UserProfile,
                attributes: ["id"],
                include: [
                  {
                    model: Media,
                    as: "avatar",
                    attributes: ["fileName", "path", "mimeType", "url"],
                  },
                ],
              },
            ],
          },
          {
            model: Room,
            attributes: ["id", "name", "slug", "price", "unit", "offerPrice"],
          },
        ],
      },
    ],
  };

  const orderCondition = [[sortBy, orderBy]];
  query.where = whereCondition;
  query.order = orderCondition as Order;
  query.limit = limit;
  query.offset = offset;

  const paginatedData = await RoomReview.findAndCountAll(query);

  const response = getPagingData({
    paginatedData,
    page,
    limit,
  });

  new ApiResponse({
    status: 200,
    message: "Reviews fetched successfully",
    data: response,
  }).send(res);
};

export default getByHost;
