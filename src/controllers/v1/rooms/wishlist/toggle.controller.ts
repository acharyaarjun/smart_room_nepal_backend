import { Wishlist } from "@/models";
import ApiResponse from "@/utils/apiResponse";
import { Request, Response } from "express";

const toggle = async (req: Request, res: Response) => {
  const user = req.user;
  const room = req.room;

  // Check if wishlist entry exists
  const existingWishlist = await Wishlist.findOne({
    where: {
      userId: user.id,
      roomId: room.id,
    },
  });

  if (existingWishlist) {
    // Remove from wishlist
    await existingWishlist.destroy({
      force: true,
    });

    new ApiResponse({
      status: 200,
      message: "Room removed from wishlist",
      data: {
        isWishlisted: false,
      },
    }).send(res);
  } else {
    // Add to wishlist
    await Wishlist.create({
      userId: user.id,
      roomId: room.id,
    });

    new ApiResponse({
      status: 201,
      message: "Room added to wishlist",
      data: {
        isWishlisted: true,
      },
    }).send(res);
  }
};

export default toggle;
