import { Media, Room, RoomRequest, User, UserProfile } from "@/models";
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
  const { roomRequestStatus } = req.query;
  const room = req.room;
  const hostUser: User = req.hostUser;
  const requestingUser: User = req.requestingUser;

  const whereCondition: any = {};

  if (room) {
    whereCondition.roomId = room.id;
  }

  if (roomRequestStatus) {
    whereCondition.status = roomRequestStatus;
  }

  // If host is provided, filter by rooms owned by the host
  if (hostUser) {
    whereCondition["$room.userId$"] = hostUser.id;
  }

  // If user is provided, filter by requests made by the user
  if (requestingUser) {
    whereCondition.userId = requestingUser.id;
  }

  const query: FindAndCountOptions = {
    attributes: [
      "id",
      "token",
      "isFixedDate",
      "startDate",
      "endDate",
      "price",
      "acceptedPrice",
      "status",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: User,
        attributes: ["id", "username", "email", "fullName"],
        include: [
          {
            model: UserProfile,
            attributes: ["id", "phone"],
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
  };

  const orderCondition = [[sortBy, orderBy]];
  query.where = whereCondition;
  query.order = orderCondition as Order;
  query.limit = limit;
  query.offset = offset;

  const paginatedData = await RoomRequest.findAndCountAll(query);

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
