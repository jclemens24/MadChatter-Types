import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../model/userModel';
import Post, { IPost } from '../model/postModel';
import Comment, { IComment } from '../model/commentsModel';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import getCoordsForAddress from '../utils/location';
import { model, Types, HydratedDocument } from 'mongoose';
import { get } from '../routes/userRoute';

interface PopulatedUser {
  following: HydratedDocument<IUser> | null;
}

interface PopulatedPost {
  comments: HydratedDocument<IComment> | null;
}

const signToken = (id: Types.ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const coordinates = await getCoordsForAddress(
      `${req.body.city} ${req.body.state}, ${req.body.zip}`
    );

    if (!coordinates)
      return next(new AppError('Unable to retrieve those coordinates', 404));

    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      location: {
        coordinates: [coordinates.lng, coordinates.lat],
        city: req.body.city,
        state: req.body.state
      },
      birthYear: req.body.birthYear
    });

    const posts = await Post.find({ toUser: newUser._id });
    const token = signToken(newUser._id);
    newUser.password = undefined;

    res.status(200).json({
      status: 'success',
      user: newUser,
      posts,
      token
    });
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return next(
        new AppError(
          'Please provide your login email and password or go sign up',
          404
        )
      );
    }

    const user = await User.findOne({ email })
      .select('+password')
      .populate({ path: 'following', strictPopulate: false });

    if (
      !user ||
      !(await user.verifyPassword(password, user.password as string))
    ) {
      return next(
        new AppError(
          'Incorrect credentials. Please check your credentials and try again',
          401
        )
      );
    }
    const posts = await Post.find({ toUser: user._id }).populate({
      path: 'comments',
      select: 'post comment',
      model: Comment
    });

    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      user,
      token,
      posts
    });
  }
);

export const verifyAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      token = undefined;
    }

    if (typeof token === 'undefined') {
      return next(
        new AppError('Oops! Access is Forbidden. Please login.', 401)
      );
    }

    const decodedJWT = jwt.verify(token, process.env.JWT_SECRET);
    const authorizedUser = await User.findById(
      (decodedJWT as jwt.JwtPayload).id
    );

    if (!authorizedUser) {
      return next(
        new AppError('User belonging to this token does not exist', 401)
      );
    } else {
      req.user = authorizedUser;
      res.locals.user = authorizedUser;
      next();
    }
  }
);
