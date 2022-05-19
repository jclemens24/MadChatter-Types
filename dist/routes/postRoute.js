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
exports.postRouter = void 0;
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controller/authController");
const postController = __importStar(require("../controller/postController"));
const commentController_1 = require("../controller/commentController");
const fileUpload_1 = require("../middleware/fileUpload");
const postRouter = express_1.default.Router();
exports.postRouter = postRouter;
postRouter.use(authController_1.verifyAuth);
postRouter.put('/:postId/like', postController.likePost);
postRouter.put('/:postId/dislike', postController.dislikePost);
postRouter
    .route('/')
    .get(postController.getAllPosts)
    .post(fileUpload_1.upload.single('image'), postController.resizePostPhoto, postController.createNewPost);
postRouter
    .route('/:postId')
    .delete(postController.deleteOnePost, commentController_1.deleteComments)
    .get(postController.getOnePost);
postRouter.get('/friends/:userId', postController.getPostByUser);
//# sourceMappingURL=postRoute.js.map