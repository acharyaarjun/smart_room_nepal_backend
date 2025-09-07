import { Amenity } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const create = async (req: Request, res: Response) => {
  const { name, icon } = req.body || {};

  const createdData = await Amenity.create({
    name,
    icon,
  });

  new ApiResponse({
    status: 201,
    message: "Amenity created successfully",
    data: createdData,
  }).send(res);
};

export default create;
