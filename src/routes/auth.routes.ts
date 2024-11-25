import { Router } from 'express';
import { googleOAuthCallback, logout, refreshToken, checkAuthStatus } from '@controllers/auth.controller';
import { upload } from '@middlewares/multer.middleware';
import passport from 'passport';
import { verifyJWT } from '@middlewares/auth.middleware';

const router = Router();

// router.post('/register', upload.any(), register);
// router.post('/login', login);
// router.post('/refresh-token', refreshToken);

router.get('/status', verifyJWT, checkAuthStatus);

router.get('/google', passport.authenticate('google', {session:false, scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleOAuthCallback);
router.post('/logout', verifyJWT, logout)

router.post('/refresh-token', refreshToken);

// router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
// router.get('/github/callback', passport.authenticate('github', { session: false }), (req, res) => {
//   res.redirect('/');
// });

export default router;
