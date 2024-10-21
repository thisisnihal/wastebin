import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {ApiError, ApiResponse, asyncHandler} from "@util/apiResponse.util"
import { conf } from 'src/conf';
import User, { IUser } from '@models/user.model';



interface IDecodedToken {
    _id: string; 
    email: string;
}

export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new ApiError(401, "Access Denied: No Token Provided");

    try {
        const decoded = jwt.verify(token, conf.ACCESS_TOKEN_SECRET!) as IDecodedToken;
        const user =  await User.findById(decoded._id).select("-password -refreshToken") as IUser;
        if (!user) throw new ApiError(401, "User not found");
        req.user = user;
        console.log("JWT user = ", user);
        next();
    } catch (err) {
        throw new ApiError(401, "Invalid Token");
    }
});

export const verifyJWTOptional = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) return next(); 

    const decoded = jwt.verify(token, conf.ACCESS_TOKEN_SECRET!) as IDecodedToken;
    const user = await User.findById(decoded._id).select("-password -refreshToken") as IUser;

    if (!user) return next();

    req.user = user;
    console.log("JWT user = ", user);

    next();
});