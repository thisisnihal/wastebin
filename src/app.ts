import express, { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser'
import cors from 'cors';
import authRoutes from '@routes/auth.routes';
import pasteRoutes from '@routes/paste.routes'
import { ApiResponse, ApiError, asyncHandler } from '@util/apiResponse.util';
import { rateLimiter } from '@middlewares/rateLimiter.middleware';
import { conf } from './conf';

const app = express();
app.set('trust proxy', true);
app.use(cors({
  origin: conf.CORS_ORIGIN,
  credentials: true
}));

// Middleware
// app.use(rateLimiter);
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// EJS
app.set('view engine', 'ejs');
app.set('views', 'src/views');

// Passport configuration
import '@config/passport.config';
import errorHandler from '@middlewares/errorHandler.middleware';
import { verifyJWT, verifyJWTOptional } from '@middlewares/auth.middleware';

import User, { IUser } from '@models/user.model';


app.use(passport.initialize());

// Routes
// Test Routes
app.use('/api/v1/auth', authRoutes);


app.get("/", asyncHandler(async (req: Request, res: Response) => {
  console.log("visited /");
  const data = { title: 'Welcome to My EJS App', message: 'Hello, EJS!' };
  res.render('index', data);
  // return res.status(200).json(new ApiResponse(200, { name: "Nihal" }, "Succesfully fetched! / "))
}));

app.get("/api/v1/", asyncHandler(async (req: Request, res: Response) => {
  console.log("visited /api/v1/");
  return res.status(200).json(new ApiResponse(200, { name: "Nihal" }, "Succesfully fetched  /api/v1/ "))
}));



app.get('/private', verifyJWT, asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  return res.status(200).json(new ApiResponse(200, { user }, "Succesfully fetched  /api/v1/ "))
}));



//
app.use(`${conf.API_ENDPOINT}/paste`, pasteRoutes);







app.use(errorHandler);
export { app }; 