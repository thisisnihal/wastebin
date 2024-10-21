import { Router } from 'express';
import { googleOAuthCallback, logout } from '@controllers/auth.controller';
import { upload } from '@middlewares/multer.middleware';
import passport from 'passport';

const router = Router();

// router.post('/register', upload.any(), register);
// router.post('/login', login);
// router.post('/refresh-token', refreshToken);

router.get('/google', passport.authenticate('google', {session:false, scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleOAuthCallback);
router.post('/logout', logout)

// router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
// router.get('/github/callback', passport.authenticate('github', { session: false }), (req, res) => {
//   res.redirect('/');
// });

export default router;
