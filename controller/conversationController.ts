import Conversation from '../model/conversationModel';
import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from './userController';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

export const getConversations = catchAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const userConversations = await Conversation.find({}).where(
      'members',
      req.user._id
    );

    if (!userConversations) {
      return next(new AppError('You have no saved conversations', 400));
    }

    res.status(200).json({
      status: 'success',
      conversations: userConversations
    });
  }
);

export const getOneConversation = catchAsync(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { friendId } = req.params;

    const conversation = await Conversation.findOne({
      members: { $all: [req.user._id, friendId] }
    });

    if (!conversation) {
      return next(
        new AppError(
          'There are no conversations with this friend. Start chatting by searching for their name',
          404
        )
      );
    }
    res.status(200).json({
      status: 'success',
      conversations: conversation
    });
  }
);
