import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const update = async (req: Request, res: Response) => {
  const membershipType = req.membershipType;
  const { name, description, limit, price, features } = req.body || {};

  const uploadPayload: any = {
    name,
    description,
    limit,
    price,
    features,
  };

  const updatedMembershipType = await membershipType.update(uploadPayload);

  new ApiResponse({
    status: 200,
    message: "Updated successfully",
    data: updatedMembershipType,
  }).send(res);
};

export default update;
