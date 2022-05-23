import sharp from 'sharp';
import { v4 } from 'uuid';
import fs from 'fs';
import User from '../model/userModel';
import Post from '../model/postModel';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { Response, Request, NextFunction } from 'express';

export const validateAUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('followers').populate({
      path: 'following',
      select:
        '-__v -birthYear -catchPhrase -email -following -followers -coverPic -location -photos'
    });

    if (!user) {
      return next(new AppError('User could not be found. Please login.', 404));
    }

    const posts = await Post.find({ toUser: userId }).populate({
      path: 'comments'
    });

    req.user = user;

    res.status(200).send({
      status: 'success',
      user,
      posts
    });
  }
);

export const unfollowAndFollowAFriend = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const userFriend = req.body.id;

    if (!userId || !userFriend) {
      return next(
        new AppError('Error processing this request. Please try again', 404)
      );
    }

    if (req.query.unfollow) {
      const friend = await User.findById(userFriend);
      await User.findByIdAndUpdate(
        {
          _id: userId
        },
        {
          $pull: { following: userFriend }
        },
        { new: true }
      );

      res.status(200).json({
        status: 'success',
        user: friend
      });
    } else if (req.query.follow) {
      const friend = await User.findById(userFriend);
      if (!friend)
        return next(new AppError('This friend no longer exists', 400));
      const alreadyFriended = await User.findById(userId).where({
        following: userFriend
      });

      if (alreadyFriended === null) {
        return next(
          new AppError('You are already friends with this person', 404)
        );
      }
      await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { following: friend._id } },
        { returnDocument: 'after' }
      );

      res.status(200).json({
        status: 'success',
        user: friend
      });
    } else {
      return next();
    }
  }
);

export const getAUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    if (!userId) {
      return next(new AppError('User could not be found', 400));
    }

    const friend = await User.findById(userId).populate('followers following');

    if (!friend) {
      return next(new AppError('Could not find this profile', 400));
    }

    req.friend = friend;
    next();
  }
);

export const suggestFriends = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { lnglat } = req.params;
    const [lng, lat] = lnglat.split(',');
    const multiplier = 0.0006213712;
    const nearbyUsers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseInt(lng, 10), parseInt(lat, 10)]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
          maxDistance: 1000000
        }
      },
      {
        $project: {
          distance: true,
          firstName: true,
          lastName: true,
          profilePic: true
        }
      },
      { $limit: 10 }
    ]);
    res.status(200).json({
      status: 'success',
      users: nearbyUsers
    });
  }
);

export const getUserPhotos = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const userPhotos = await User.findById(userId, 'photos');
    if (!userPhotos) {
      return next(new AppError('User has no photos', 400));
    }

    res.status(200).json({
      status: 'success',
      photos: userPhotos
    });
  }
);

export const setUserPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const updatePhoto = await User.findByIdAndUpdate(
      userId,
      { profilePic: req.body.photo },
      {
        new: true
      }
    );

    res.status(200).json({
      status: 'success',
      user: updatePhoto
    });
  }
);

export const setUserCoverPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const updatePhoto = await User.findByIdAndUpdate(
      req.user._id,
      { coverPic: req.params.pid },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      user: updatePhoto
    });
  }
);

export const resizeUserPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();
    const filename = `user-${v4()}.jpeg`;
    req.file.filename = filename;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/images/${req.file.filename}`);

    next();
  }
);

export const resizeUserCoverPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();
    const filename = `user-${v4()}.jpeg`;
    req.file.filename = filename;

    await sharp(req.file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/images/${filename}`);

    next();
  }
);

export const uploadUserPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const image = req.file.filename;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        profilePic: image,
        $push: {
          photos: image
        }
      },
      { new: true }
    );

    if (!user || !user.profilePic) {
      return next(new AppError('', 404));
    }

    res.status(200).json({
      status: 'success',
      photo: user.profilePic
    });
  }
);

export const uploadCoverPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const image = req.file.filename;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        coverPic: image,
        $push: {
          photos: image
        }
      },
      { new: true }
    );

    if (!user) {
      return next(
        new AppError(
          'Could not upload this image because the user does not exist',
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      photo: user.coverPic
    });
  }
);

export const deleteUserPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const photoName = req.params.pid;
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          photos: photoName
        }
      },
      { new: true }
    );

    fs.unlink(`${__dirname}/../public/images/${photoName}`, err => {
      if (err)
        return next(
          new AppError('Could not delete that photo, try again', 404)
        );
    });

    res.status(200).json({
      status: 'success',
      message: 'Photo has been deleted'
    });
  }
);

export const handleUserSearch = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { filter } = req.query;
    console.log(filter);
    if (typeof filter === 'string') {
      const user = await User.find({ firstName: filter });
      res.status(200).json({
        status: 'success',
        user
      });
    } else {
      return next(new AppError('Error searching..', 404));
    }
  }
);
