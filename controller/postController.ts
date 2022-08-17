import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from './userController';
import sharp from 'sharp';
import { v4 } from 'uuid';
import Post from '../model/postModel';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import Comment from '../model/commentsModel';

export const getAllPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const posts = await Post.find({}).populate({
      path: 'comments',
      model: Comment
    });

    res.status(200).json({
      status: 'success',
      posts
    });
  }
);

export const getPostByUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const posts = await Post.find({ toUser: req.params.userId }).populate({
      path: 'comments',
      model: Comment
    });

    if (!posts)
      return next(
        new AppError(
          'Could not find that post or you must login to access these posts',
          401
        )
      );

    res.status(200).json({
      status: 'success',
      posts
    });
  }
);

export const getOnePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const post = await Post.findById(req.params.postId).populate({
      path: 'comments',
      model: Comment
    });

    if (!post) return next(new AppError('There is no post by that Id', 404));

    res.status(200).json({
      status: 'success',
      post
    });
  }
);

export const resizePostPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();
    const filename = `post-${v4()}.jpeg`;
    req.file.filename = filename;
    const inputBuffer: Buffer = req.file.buffer;

    await sharp(inputBuffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/images/${req.file.filename}`);

    next();
  }
);

export const createNewPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let image: string | Buffer | null;
    if (req.file) {
      image = req.file.filename;
    } else {
      image = null;
    }

    const newPost = await Post.create({
      toUser: req.body.to,
      fromUser: req.body.from,
      desc: req.body.desc,
      image: image,
      comments: []
    });

    res.status(200).json({
      status: 'success',
      post: newPost
    });
  }
);

export const likePost = catchAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    const checkPostLiked = await Post.findById(postId).where(
      'likes',
      req.user._id
    );

    if (checkPostLiked)
      return next(new AppError('You already have liked this post', 400));

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: req.user._id }
      },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      post: post,
      user: req.user._id
    });
  }
);

export const dislikePost = catchAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: { $in: [req.user._id] } }
      },
      { returnDocument: 'after' }
    );

    if (!post) {
      return next(
        new AppError('This post does not exist or may have been deleted', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      post: post,
      user: req.user._id
    });
  }
);

export const deleteOnePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const post = await Post.findByIdAndDelete(postId);

    if (!post) return next(new AppError('There is no post by that ID', 404));

    next();
  }
);

export const getFriendsPosts = catchAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const friendPost = await Post.find({ toUser: req.friend._id }).populate({
      path: 'comments',
      model: Comment
    });

    if (!friendPost)
      return next(
        new AppError(
          'Could not find any posts by this user. Please try your request again',
          404
        )
      );

    res.status(200).json({
      status: 'success',
      user: req.friend,
      posts: friendPost
    });
  }
);
