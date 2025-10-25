import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const update = async (req: Request, res: Response) => {
  const review = req.review;
  const { rating, message, mediaId } = req.body;

  const updateData: any = {};
  if (rating !== undefined) updateData.rating = rating;
  if (message !== undefined) updateData.message = message;
  if (mediaId !== undefined) updateData.mediaId = mediaId;

  await review.update(updateData);

  new ApiResponse({
    status: 200,
    message: "Review updated successfully",
    data: review,
  }).send(res);
};

export default update;
