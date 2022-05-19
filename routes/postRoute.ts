import express from 'express';
import { verifyAuth } from '../controller/authController';
import * as postController from '../controller/postController';
import { deleteComments } from '../controller/commentController';
import { upload } from '../middleware/fileUpload';
import { router } from './userRoute';

const postRouter = express.Router();

postRouter.use(verifyAuth);
postRouter.put('/:postId/like', postController.likePost);
postRouter.put('/:postId/dislike', postController.dislikePost);
postRouter
  .route('/')
  .get(postController.getAllPosts)
  .post(
    upload.single('image'),
    postController.resizePostPhoto,
    postController.createNewPost
  );

postRouter
  .route('/:postId')
  .delete(postController.deleteOnePost, deleteComments)
  .get(postController.getOnePost);

postRouter.get('/friends/:userId', postController.getPostByUser);

export { postRouter };
