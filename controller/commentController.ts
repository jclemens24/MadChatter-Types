import Comment from '../model/commentsModel';
import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from './userController';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';

export const setPostUserId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.post) req.body.post = req.params.postId;
  if (!req.body.user) req.body.user = req.user._id;
  console.log(req.body.post, req.body.user);
  next();
};

export const getAllComments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    const comment = await Comment.find({ post: postId });

    res.status(200).json({
      status: 'success',
      comments: comment
    });
  }
);

export const createComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body.comment);
    const comment = await Comment.create({
      post: req.body.post,
      user: req.body.user,
      comment: req.body.comment
    });

    if (!comment)
      return next(
        new AppError(
          'Error creating the comment. Please try your request again',
          404
        )
      );

    res.status(201).json({
      status: 'success',
      comment
    });
  }
);

export const deleteComments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const comment = await Comment.deleteMany({ post: req.params.postId });

    if (!comment)
      return next(new AppError('No associated comments with this post', 404));
    res.status(204).json({
      status: 'success'
    });
  }
);
