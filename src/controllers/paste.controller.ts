import { Request, Response } from 'express';
import Paste from '@models/paste.model';
import S3Service from '@services/s3.service';
import { IUser } from '@models/user.model';
import { ApiError, ApiResponse, asyncHandler } from '@util/apiResponse.util';

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

    const text = await S3Service.getText(paste.s3Key);
    res.status(201).json(new ApiResponse(201, { text: text, createdAt: paste.createdAt  }, 'Paste fetched'));
  } catch (error) {
    throw new ApiError(501, 'Error while fetching paste')
  }
});
