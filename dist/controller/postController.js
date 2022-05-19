"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFriendsPosts = exports.deleteOnePost = exports.dislikePost = exports.likePost = exports.createNewPost = exports.resizePostPhoto = exports.getOnePost = exports.getPostByUser = exports.getAllPosts = void 0;
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const postModel_1 = __importDefault(require("../model/postModel"));
const appError_1 = require("../utils/appError");
const catchAsync_1 = require("../utils/catchAsync");
const commentsModel_1 = __importDefault(require("../model/commentsModel"));
exports.getAllPosts = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield postModel_1.default.find({}).populate({
        path: 'comments',
        model: commentsModel_1.default
    });
    res.status(200).json({
        status: 'success',
        posts
    });
}));
exports.getPostByUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield postModel_1.default.find({ toUser: req.params.userId }).populate({
        path: 'comments',
        model: commentsModel_1.default
    });
    if (!posts)
        return next(new appError_1.AppError('Could not find that post or you must login to access these posts', 401));
    res.status(200).json({
        status: 'success',
        posts
    });
}));
exports.getOnePost = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield postModel_1.default.findById(req.params.postId).populate({
        path: 'comments',
        model: commentsModel_1.default
    });
    if (!post)
        return next(new appError_1.AppError('There is no post by that Id', 404));
    res.status(200).json({
        status: 'success',
        post
    });
}));
exports.resizePostPhoto = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return next();
    const filename = `post-${(0, uuid_1.v4)()}.jpeg`;
    req.file.filename = filename;
    const inputBuffer = req.file.buffer;
    yield (0, sharp_1.default)(inputBuffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/${req.file.filename}`);
    next();
}));
exports.createNewPost = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let image;
    if (req.file) {
        image = req.file.filename;
    }
    else {
        image = null;
    }
    const newPost = yield postModel_1.default.create({
        toUser: req.body.to,
        fromUser: req.body.from,
        desc: req.body.desc,
        image: image
    });
    res.status(200).json({
        status: 'success',
        post: newPost
    });
}));
exports.likePost = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const checkPostLiked = yield postModel_1.default.findById(postId).where('likes', req.user._id);
    if (checkPostLiked)
        return next(new appError_1.AppError('You already have liked this post', 400));
    const post = yield postModel_1.default.findByIdAndUpdate(postId, {
        $push: { likes: req.user._id }
    }, { new: true });
    res.status(200).json({
        status: 'success',
        post: post,
        user: req.user._id
    });
}));
exports.dislikePost = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const post = yield postModel_1.default.findByIdAndUpdate(postId, {
        $pull: { likes: { $in: [req.user._id] } }
    }, { returnDocument: 'after' });
    if (!post) {
        return next(new appError_1.AppError('This post does not exist or may have been deleted', 404));
    }
    res.status(200).json({
        status: 'success',
        post: post,
        user: req.user._id
    });
}));
exports.deleteOnePost = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const post = yield postModel_1.default.findByIdAndDelete(postId);
    if (!post)
        return next(new appError_1.AppError('There is no post by that ID', 404));
    next();
}));
exports.getFriendsPosts = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const friendPost = yield postModel_1.default.find({ toUser: req.friend._id }).populate({
        path: 'comments',
        model: commentsModel_1.default
    });
    if (!friendPost)
        return next(new appError_1.AppError('Could not find any posts by this user. Please try your request again', 404));
    res.status(200).json({
        status: 'success',
        user: req.friend,
        posts: friendPost
    });
}));
//# sourceMappingURL=postController.js.map