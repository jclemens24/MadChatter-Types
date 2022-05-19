import { Router } from 'express';
import * as messageController from '../controller/messageController';
import { verifyAuth } from '../controller/authController';

const messageRouter = Router();

messageRouter.use(verifyAuth);
messageRouter.get('/:chatId', messageController.getChatroomMessages);
messageRouter.post('/', messageController.createMessage);

export { messageRouter };
