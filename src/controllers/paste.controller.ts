import { Request, Response } from "express";
import Paste, { Visibility } from "@models/paste.model";
import S3Service from "@services/s3.service";
import { IUser } from "@models/user.model";
import { ApiError, ApiResponse, asyncHandler } from "@util/apiResponse.util";
import s3Service from "@services/s3.service";

// TODO: Must check the final returned value by api
// DO NOT FORGET TO REMOVE EXPOSED DATA LIKE  "paste"

export const createPaste = asyncHandler(async (req: Request, res: Response) => {
  const { text, language, visibility, authorizedEmails, expiration } = req.body;
  const userId = (req.user as IUser)?.id || null;

  if (!text || !expiration)
    throw new ApiError(400, "Text and expiration time are required");

  try {
    const s3Key = await S3Service.uploadText(text);

    const pasteData: any = {
      userId,
      s3Key,
      expiration,
    };

    if (language) pasteData.language = language;
    if (userId && visibility) pasteData.visibility = visibility;
    if (userId && authorizedEmails && visibility === "custom") {
      pasteData.authorizedEmails = authorizedEmails;
    }

    const paste = new Paste(pasteData);
    await paste.save();
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { text: text, pasteId: paste._id },
          "Paste Created"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(501, "Error creating paste");
  }
});

export const getPaste = asyncHandler(async (req: Request, res: Response) => {
  const { pasteId } = req.params;
  const userId = (req.user as IUser)?.id || null;
  const userEmail = (req.user as IUser)?.email || null;

  if (!pasteId) {
    throw new ApiError(400, "paste Id is required");
  }

  try {
    const paste = await Paste.findById(pasteId);
    if (!paste) throw new ApiError(404, "Paste Not found");

    if (paste.visibility === Visibility.PRIVATE) {
      if (!userId || userId !== paste.userId?.toString()) {
        throw new ApiError(401, "Unauthorized access");
      }
    }

    const isUserUnauthorized = userId !== paste.userId?.toString();
    const isCustomVisibility = paste.visibility === Visibility.CUSTOM;
    const isUserEmailUnauthorized =
      !userEmail || !paste.authorizedEmails?.includes(userEmail);

    if (isUserUnauthorized && isCustomVisibility && isUserEmailUnauthorized) {
      throw new ApiError(401, "Unauthorized access");
    }

    const currentDate = new Date();
    const expireDate = new Date(paste.expiration!);
    if (paste.expiration && expireDate && currentDate >= expireDate) {
      await s3Service.deleteObject(paste.s3Key);
      await paste.deleteOne();
      throw new ApiError(401, "The Paste has already expired!");
    }

    // const text = await S3Service.getText(paste.s3Key);
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { paste },
          "Paste fetched"
        )
      );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(501, "Error while fetching paste");
  }
});

export const getPresignedUploadUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, language, expiration, visibility, authorizedEmails } =
      req.body;
    const userId = (req.user as IUser)?.id || null;

    // if (!expiration) throw new ApiError(400, "expiration time are required");

    try {
      const { presignedUrl, s3Key } = await S3Service.getPresignedUploadUrl();

      const expirationDate = expiration ? new Date(expiration) : null;
      const pasteData: any = {
        title,
        userId,
        s3Key,
        expiration: expirationDate,
      };

      if (language) pasteData.language = language;
      if (userId && visibility) pasteData.visibility = visibility;
      if (userId && authorizedEmails && visibility === "custom") {
        pasteData.authorizedEmails = authorizedEmails;
      }

      const paste = new Paste(pasteData);

      await paste.save();

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { presignedUrl, pasteId: paste._id, paste },
            "Presigned URL generated, paste created"
          )
        );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(501, `Error creating paste: ${error}`);
    }
  }
);

export const getPresignedFetchUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { pasteId } = req.params;
    const userId = (req.user as IUser)?.id || null;
    const userEmail = (req.user as IUser)?.email || null;

    if (!pasteId) {
      throw new ApiError(400, "paste Id is required");
    }

    try {
      const paste = await Paste.findById(pasteId);
      if (!paste) throw new ApiError(400, "Paste not found!");

      if (paste.visibility === Visibility.PRIVATE) {
        if (!userId || userId !== paste.userId?.toString()) {
          throw new ApiError(401, "Unauthorized access");
        }
      }

      const isUserUnauthorized = userId !== paste.userId?.toString();
      const isCustomVisibility = paste.visibility === Visibility.CUSTOM;
      const isUserEmailUnauthorized =
        !userEmail || !paste.authorizedEmails?.includes(userEmail);
  
      if (isUserUnauthorized && isCustomVisibility && isUserEmailUnauthorized) {
        throw new ApiError(401, "Unauthorized access");
      }

      const currentDate = new Date();
      const expireDate = new Date(paste.expiration!);
      if (paste.expiration && expireDate && currentDate >= expireDate) {
        await s3Service.deleteObject(paste.s3Key);
        await paste.deleteOne();
        throw new ApiError(401, "The Paste has already expired!");
      }

      const presignedUrl = await S3Service.getPresignedFetchUrl(paste.s3Key);

      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { presignedUrl },
            "Presigned URL generated to fetch the paste"
          )
        );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(501, "Error fetching the presigned URL for the paste");
    }
  }
);

export const deletePaste = asyncHandler(async (req: Request, res: Response) => {
  const { pasteId } = req.params;
  const userId = (req.user as IUser)?.id || null;

  if (!pasteId) {
    throw new ApiError(400, "paste Id is required");
  }

  try {
    const paste = await Paste.findById(pasteId);
    if (!paste) throw new ApiError(400, "Paste not found!");

    if (!userId || userId !== paste.userId?.toString())
      throw new ApiError(401, "Unauthorized access");

    await s3Service.deleteObject(paste.s3Key);
    await paste.deleteOne();

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          null,
          `Paste with id=${paste._id} has been deleted successfully`
        )
      );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(501, "Error while deleting the paste");
  }
});

export const getAllPaste = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as IUser)?.id || null;

  if (!userId) throw new ApiError(401, "Not Authorized!");

  try {
    const pastes = await Paste.find({ userId });
    if (!pastes) throw new ApiError(400, "Pastes not found!");

    res
      .status(201)
      .json(new ApiResponse(201, pastes, "All Pastes successfully fetched"));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(501, "Error while deleting the paste");
  }
});
