import { CookieOptions, Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "@util/apiResponse.util";
import User, { IUser } from "@models/user.model";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { conf } from "src/conf";

export const logout = asyncHandler(async (req: Request, res: Response) => {
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
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions);
    res.redirect("http://localhost:3000/");
  }
);

interface IDecodedToken {
    _id: string; 
    email: string;
}
export const refreshToken =  asyncHandler(async (req:Request, res:Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }
  try {
    const decoded = jwt.verify(refreshToken, conf.REFRESH_TOKEN_SECRET) as IDecodedToken;
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new ApiError(401, "User not found");
    }
    const newAccessToken = user.generateAccessToken();
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };

    res.status(200).cookie("accessToken", newAccessToken, cookieOptions);
  } catch (err) {
    throw new ApiError(403, "Invalid refresh token");
  }
});

export const checkAuthStatus = asyncHandler(async (req:Request, res:Response) => {
  const userId = (req.user as IUser)?.id || null;

  if (!userId) {
    throw new ApiError(400, "Not Authorized");
  } else {
   return res.status(200).json({"sucess": "true"});
  }
});