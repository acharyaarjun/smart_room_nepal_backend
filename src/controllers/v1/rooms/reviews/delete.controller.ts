import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const deleteReview = async (req: Request, res: Response) => {
  const review = req.review;

  await review.destroy();

  new ApiResponse({
    status: 200,
    message: "Review deleted successfully",
  }).send(res);
};

export default deleteReview;
