import { Router } from 'express';
import { createPaste, getPaste } from '@controllers/paste.controller';
import {verifyJWTOptional} from '@middlewares/auth.middleware';
import { upload } from '@middlewares/multer.middleware';

const router: Router = Router();

router.post('/new-paste', verifyJWTOptional, upload.none(),createPaste);

router.get('/get-paste/:pasteId', getPaste);

export default router;
