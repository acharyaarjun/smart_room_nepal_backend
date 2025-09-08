import { Amenity, RoomAmenity } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const update = async (req: Request, res: Response) => {
  const roomAmenity = req.roomAmenity;
  const amenity = req.amenity;
  const { description } = req.body || {};
  const uploadPayload: any = {
    description,
    amenityId: amenity ? amenity.id : roomAmenity.amenityId,
  };

  const updatedData = await roomAmenity.update(uploadPayload);

  const sendData = await RoomAmenity.findByPk(updatedData.id, {
    attributes: ["id", "description", "createdAt", "updatedAt"],
    include: [
      {
        model: Amenity,
      },
    ],
  });

  new ApiResponse({
    status: 200,
    message: "Updated successfully",
    data: sendData,
  }).send(res);
};

export default update;
