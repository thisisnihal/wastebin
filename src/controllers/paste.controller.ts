import { Request, Response } from 'express';
import Paste from '@models/paste.model';
import S3Service from '@services/s3.service';
import { IUser } from '@models/user.model';
import { ApiError, ApiResponse, asyncHandler } from '@util/apiResponse.util';
import s3Service from '@services/s3.service';

// Create a new paste
export const createPaste = asyncHandler(async (req: Request, res: Response) => {
  const { text, expiration } = req.body;
  const userId = (req.user as IUser)?.id || null;

  if (!text || !expiration) throw new ApiError(400, 'Text and expiration time are required');
  try {
    const s3Key = await S3Service.uploadText(text);
    
    const paste = new Paste({
      userId,
      s3Key,
      expiration,
    });
    await paste.save();
    res.status(201).json(new ApiResponse(201, { text: text, pasteId: paste._id }, 'Paste Created'));
  } catch (error) {
    throw new ApiError(501, 'Error creating paste')
}
});

export const getPaste = asyncHandler(async (req: Request, res: Response) => {
  const { pasteId } = req.params;

  try {
    const paste = await Paste.findById(pasteId);
    if (!paste) {
        throw new ApiError(404, 'Paste Not found')
    }
    const currentDate = new Date();
    const expireDate = new Date(paste.expiration!)
    if (expireDate && currentDate >= expireDate) {
        await s3Service.deleteObject(paste.s3Key);
        await paste.deleteOne();
        throw new ApiError(401, 'The Paste has already expired!');
    }

    const text = await S3Service.getText(paste.s3Key);
    res.status(201).json(new ApiResponse(201, { text: text, createdAt: paste.createdAt  }, 'Paste fetched'));
  } catch (error) {
    throw new ApiError(501, 'Error while fetching paste')
  }
});


export const getPresignedUploadUrl = asyncHandler(async (req: Request, res: Response) => {
  const { expiration } = req.body; 
  const userId = (req.user as IUser)?.id || null; 

  if (!expiration) {
    throw new ApiError(400, 'Expiration time is required');
  }

  try {
    const { presignedUrl, s3Key } = await S3Service.getPresignedUploadUrl();

    const paste = new Paste({
      userId,
      s3Key,
      expiration,
    });

    await paste.save();

    res.status(201).json(new ApiResponse(201, { presignedUrl, pasteId: paste._id }, 'Presigned URL generated, paste created'));
  } catch (error) {
    throw new ApiError(501, 'Error creating paste');
  }

});


export const getPresignedFetchUrl = asyncHandler(async (req: Request, res: Response) => {
  const { pasteId } = req.params; 
  const userId = (req.user as IUser)?.id || null; 

  if (!pasteId) {
    throw new ApiError(400, 'paste Id is required');
  }

  try {
    const paste = await Paste.findById(pasteId);
    if (!paste) throw new ApiError(400, 'Paste not found!');

    const currentDate = new Date();
    const expireDate = new Date(paste.expiration!);
    if (expireDate && currentDate >= expireDate) {
        await s3Service.deleteObject(paste.s3Key);
        await paste.deleteOne();
        throw new ApiError(401, 'The Paste has already expired!');
    }


    const presignedUrl = await S3Service.getPresignedFetchUrl(paste.s3Key);

    res.status(201).json(new ApiResponse(201, { presignedUrl }, 'Presigned URL generated to fetch the paste'));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(501, 'Error fetching the presigned URL for the paste');
  }
});



export const deletePaste =  asyncHandler(async (req: Request, res: Response) => {
  const {pasteId} = req.params;
  if (!pasteId) {
    throw new ApiError(400, 'paste Id is required');
  }

  try {
    const paste = await Paste.findById(pasteId);
    if (!paste) throw new ApiError(400, 'Paste not found!');

    await s3Service.deleteObject(paste.s3Key);
    await paste.deleteOne();

    res.status(201).json(new ApiResponse(201, null, `Paste with id=${paste._id} has been deleted successfully`));
  } catch (error) {
    throw new ApiError(501, 'Error while deleting the paste');
  }

});