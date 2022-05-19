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
exports.deleteComments = exports.createComment = exports.getAllComments = exports.setPostUserId = void 0;
const commentsModel_1 = __importDefault(require("../model/commentsModel"));
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const setPostUserId = (req, res, next) => {
    if (!req.body.post)
        req.body.post = req.params.postId;
    if (!req.body.user)
        req.body.user = req.user._id;
    next();
};
exports.setPostUserId = setPostUserId;
exports.getAllComments = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const comment = yield commentsModel_1.default.find({ post: postId });
    res.status(200).json({
        status: 'success',
        comments: comment
    });
}));
exports.createComment = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield commentsModel_1.default.create(req.body);
    if (!comment)
        return next(new appError_1.AppError('Error creating the comment. Please try your request again', 404));
    res.status(201).json({
        status: 'success',
        comment
    });
}));
exports.deleteComments = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield commentsModel_1.default.deleteMany({ post: req.params.postId });
    if (!comment)
        return next(new appError_1.AppError('No associated comments with this post', 404));
    res.status(204).json({
        status: 'success'
    });
}));
//# sourceMappingURL=commentController.js.map