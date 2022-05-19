import { Router } from 'express';
import * as conversationController from '../controller/conversationController';
import { verifyAuth } from '../controller/authController';

const conversationRouter = Router();

conversationRouter.use(verifyAuth);
conversationRouter.route('/').get(conversationController.getConversations);
conversationRouter.get('/:friendId', conversationController.getOneConversation);

export { conversationRouter };
