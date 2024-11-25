import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "@util/apiResponse.util";
import { IUser } from "@models/user.model";
import Paste from "@models/paste.model";

export const getDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as IUser)?._id;

    if (!userId) throw new ApiError(403, "Unauthorized access! Login First");

    try {
      const pastes = await Paste.find({ userId });

      if (!pastes.length)
        throw new ApiError(404, "No pastes found for this user");
      res.status(200).json(new ApiResponse(201, { pastes }, "Paste Created"));
    } catch (error) {
      throw new ApiError(501, "Error while fetching pastes");
    }
  }
);
