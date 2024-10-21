import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "@util/apiResponse.util";
import User, { IUser } from "@models/user.model";



export const logout = asyncHandler(async (req:Request, res:Response) => {
  const user = req.user as IUser;
  await User.findByIdAndUpdate(
    user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

export const googleOAuthCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const tempUser = req.user as IUser;
    const user = await User.findById(tempUser.id);
    if (!user) {
      throw new ApiError(401, "token expired sign in again");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.save();
    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
    res.redirect(`/`);
  }
);
