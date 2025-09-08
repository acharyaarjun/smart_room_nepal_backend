import { Amenity, RoomAmenity } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const create = async (req: Request, res: Response) => {
  const { description } = req.body || {};
  const room = req.room;
  const amenity = req.amenity;

  const createdData = await RoomAmenity.create({
    roomId: room.id,
    amenityId: amenity.id,
    description,
  });

  const roomAmenity = await RoomAmenity.findByPk(createdData.id, {
    attributes: ["id", "description", "createdAt", "updatedAt"],
    include: [
      {
        model: Amenity,
      },
    ],
  });

  new ApiResponse({
    status: 201,
    message: "Amenity created successfully",
    data: roomAmenity,
  }).send(res);
};

export default create;
