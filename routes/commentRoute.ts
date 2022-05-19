import express from 'express';
import { verifyAuth } from '../controller/authController';
import * as commentController from '../controller/commentController';

const commentRouter = express.Router({ mergeParams: true });

commentRouter.use(verifyAuth);

commentRouter
  .route('/')
  .post(commentController.setPostUserId, commentController.createComment)
  .get(commentController.getAllComments);

export { commentRouter };
