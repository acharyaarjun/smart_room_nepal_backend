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

const getByAdmin = async (req: Request, res: Response) => {
  const { page, size, sortBy, orderBy } = decodeGetQuery(req.query);
  const { limit, offset } = getPagination({ page, size });
  const { rating, room } = req.query;
  const hostUser: User = req.hostUser;
  const reviewingUser: User = req.reviewingUser;

  const whereCondition: any = {};

  if (rating) {
    whereCondition.rating = rating;
  }

  if (room) {
    whereCondition["$roomRequest.room.slug$"] = room;
  }

  // Filter by host - reviews for rooms owned by specific host
  if (hostUser) {
    whereCondition["$roomRequest.room.user_id$"] = hostUser.id;
  }

  // Filter by user - reviews made by specific user
  if (reviewingUser) {
    whereCondition["$roomRequest.user_id$"] = reviewingUser.id;
  }

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
            attributes: ["id", "username", "email", "fullName"],
            include: [
              {
                model: UserProfile,
                attributes: ["id", "phone", "status"],
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
            include: [
              {
                model: User,
                attributes: ["id", "username", "email", "fullName"],
                include: [
                  {
                    model: UserProfile,
                    attributes: ["id", "phone", "status"],
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
            ],
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

export default getByAdmin;
