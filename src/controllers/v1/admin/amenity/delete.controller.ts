import ApiResponse from "@/utils/apiResponse";
import { sequelize } from "./../../../../config/db.config";
import { Request, Response } from "express";

const destroy = async (req: Request, res: Response) => {
  const amenity = req.amenity;

  await amenity.destroy({
    force: true,
  });

  new ApiResponse({
    status: 204,
  }).send(res);
};

export default destroy;
