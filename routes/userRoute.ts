import express from 'express';
import * as authController from '../controller/authController';
import * as userController from '../controller/userController';
import { getFriendsPosts } from '../controller/postController';
import { upload } from '../middleware/fileUpload';
import 'reflect-metadata';

const router = express.Router();

export function get(path: string) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    Reflect.defineMetadata('path', path, target, key);
  };
}

router.post('/login', authController.login);
router.post('/signup', authController.signup);

router.use(authController.verifyAuth);
router.get('/', userController.validateAUser);
router.get('/:lnglat', userController.suggestFriends);
router
  .route('/:userId/photos')
  .get(userController.getUserPhotos)
  .put(userController.setUserPhoto)
  .post(
    upload.single('image'),
    userController.resizeUserPhoto,
    userController.uploadUserPhoto
  )
  .patch(
    upload.single('image'),
    userController.resizeUserCoverPhoto,
    userController.uploadCoverPhoto
  );

router
  .route('/photos/:pid')
  .patch(userController.deleteUserPhoto)
  .put(userController.setUserCoverPhoto);

router.route('/:userId/friends').patch(userController.unfollowAndFollowAFriend);
router.get(
  '/:userId/profile/friends',
  userController.getAUserProfile,
  getFriendsPosts
);

router.get('/search', userController.handleUserSearch);

export { router };
