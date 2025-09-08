import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const destroy = async (req: Request, res: Response) => {
  const roomAmenity = req.roomAmenity;

  await roomAmenity.destroy({
    force: true,
  });

  new ApiResponse({
    status: 204,
  }).send(res);
};

export default destroy;
