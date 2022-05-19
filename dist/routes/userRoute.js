"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.get = void 0;
const express_1 = __importDefault(require("express"));
const authController = __importStar(require("../controller/authController"));
const userController = __importStar(require("../controller/userController"));
const postController_1 = require("../controller/postController");
const fileUpload_1 = require("../middleware/fileUpload");
require("reflect-metadata");
const router = express_1.default.Router();
exports.router = router;
function get(path) {
    return function (target, key, desc) {
        Reflect.defineMetadata('path', path, target, key);
    };
}
exports.get = get;
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.use(authController.verifyAuth);
router.get('/', userController.validateAUser);
router.get('/:lnglat', userController.suggestFriends);
router
    .route('/:userId/photos')
    .get(userController.getUserPhotos)
    .put(userController.setUserPhoto)
    .post(fileUpload_1.upload.single('image'), userController.resizeUserPhoto, userController.uploadUserPhoto)
    .patch(fileUpload_1.upload.single('image'), userController.resizeUserCoverPhoto, userController.uploadCoverPhoto);
router
    .route('/photos/:pid')
    .patch(userController.deleteUserPhoto)
    .put(userController.setUserCoverPhoto);
router.route('/:userId/friends').patch(userController.unfollowAndFollowAFriend);
router.get('/:userId/profile/friends', userController.getAUserProfile, postController_1.getFriendsPosts);
//# sourceMappingURL=userRoute.js.map