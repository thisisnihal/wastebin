import { getDashboard } from '@controllers/dashboard.controller';
import { verifyJWT } from '@middlewares/auth.middleware';
import { Router } from 'express';

const router = Router();

router.get('/dashboard', verifyJWT, getDashboard)


export default router;