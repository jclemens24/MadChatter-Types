import Message from '../model/messageModel';
import { Request, Response, NextFunction } from 'express';
import Conversation from '../model/conversationModel';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

export const getChatroomMessages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const messages = await Message.find({ conversationId: req.params.chatId });

    if (!messages) {
      return next(new AppError('Cannot find any messages', 400));
    }
    res.status(200).json({
      status: 'success',
      messages
    });
  }
);

export const createMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const conversationExists = await Conversation.find({
      _id: req.body.conversationId
    });

    if (conversationExists) {
      const addMessages = await Message.create({
        sender: req.body.sender,
        text: req.body.text,
        conversationId: req.body.conversationId
      });

      const message = await Message.findOne({ _id: addMessages._id });

      res.status(200).json({
        status: 'success',
        messages: message
      });
    } else {
      const conversation = await Conversation.create({
        members: [req.body.sender, req.body.reciever]
      });

      const message = await Message.create({
        sender: req.body.sender,
        text: req.body.text,
        conversationId: conversation._id
      });

      res.status(200).json({
        status: 'success',
        messages: message
      });
    }
  }
);
