import { Media, Room, RoomRequest, User, UserProfile } from "@/models";
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
  const { roomRequestStatus } = req.query;
  const room = req.room;

  const user = req.user;

  const whereCondition: any = {};

  if (user) {
    whereCondition.userId = user.id;
  }

  if (room) {
    whereCondition.roomId = room.id;
  }

  if (roomRequestStatus) {
    whereCondition.status = roomRequestStatus;
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
        model: Room,
        attributes: [
          "id",
          "name",
          "slug",
          "price",
          "unit",
          "offerPrice",
          "address",
          "roomType",
          "maxCapacity",
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
export default get;
