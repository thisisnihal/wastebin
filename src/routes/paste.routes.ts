import { Router } from 'express';
import { createPaste, deletePaste, getPaste, getPresignedFetchUrl, getPresignedUploadUrl } from '@controllers/paste.controller';
import {verifyJWTOptional} from '@middlewares/auth.middleware';
import { upload } from '@middlewares/multer.middleware';

const router: Router = Router();

router.post('/new-paste', verifyJWTOptional, upload.none(),createPaste);

router.get('/get-paste/:pasteId', getPaste);

router.delete('/delete-paste/:pasteId', verifyJWTOptional, deletePaste);

router.post('/get-presigned-upload-url', verifyJWTOptional, getPresignedUploadUrl)

router.post('/get-presigned-fetch-url/:pasteId', verifyJWTOptional, getPresignedFetchUrl)

export default router;
