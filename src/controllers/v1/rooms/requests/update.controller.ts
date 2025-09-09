import { Role, RoomRequestStatus } from "@/enums";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const update = async (req: Request, res: Response) => {
  const roomRequest = req.roomRequest;
  const { acceptedPrice, status } = req.body || {};
  const user = req.user;

  if (user.role === Role.USER) {
    if (status !== RoomRequestStatus.CANCELED) {
      throw new Error("Invalid status update");
    }

    roomRequest.update({ status: RoomRequestStatus.CANCELED });
  } else {
    roomRequest.update({ acceptedPrice, status });
  }

  new ApiResponse({
    status: 200,
    message: "Room request updated successfully",
  }).send(res);
};
export default update;
