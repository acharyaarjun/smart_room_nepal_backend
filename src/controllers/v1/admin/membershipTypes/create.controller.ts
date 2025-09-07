import { District, MembershipType } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { generateUniqueSlug } from "@/utils/slugify";
import { Request, Response } from "express";

const create = async (req: Request, res: Response) => {
  const { name, description, limit, price, features } = req.body || {};

  const slug = await generateUniqueSlug({
    model: District,
    text: name,
  });

  const createdData = await MembershipType.create({
    name,
    description,
    limit,
    price,
    features,
    slug,
  });

  new ApiResponse({
    status: 201,
    message: "Membership Type created successfully",
    data: createdData,
  }).send(res);
};

export default create;
