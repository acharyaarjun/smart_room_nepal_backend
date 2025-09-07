import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const update = async (req: Request, res: Response) => {
  const amenity = req.amenity;

  const { name, icon } = req.body || {};
  const uploadPayload: any = {
    name,
    icon,
  };

  const updatedAmenity = await amenity.update(uploadPayload);

  new ApiResponse({
    status: 200,
    message: "Updated successfully",
    data: updatedAmenity,
  }).send(res);
};

export default update;
