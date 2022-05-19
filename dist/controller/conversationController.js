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
exports.getOneConversation = exports.getConversations = void 0;
const conversationModel_1 = __importDefault(require("../model/conversationModel"));
const appError_1 = require("../utils/appError");
const catchAsync_1 = require("../utils/catchAsync");
exports.getConversations = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userConversations = yield conversationModel_1.default.find({}).where('members', req.user._id);
    if (!userConversations) {
        return next(new appError_1.AppError('You have no saved conversations', 400));
    }
    res.status(200).json({
        status: 'success',
        conversations: userConversations
    });
}));
exports.getOneConversation = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { friendId } = req.params;
    const conversation = yield conversationModel_1.default.findOne({
        members: { $all: [req.user._id, friendId] }
    });
    if (!conversation) {
        return next(new appError_1.AppError('There are no conversations with this friend. Start chatting by searching for their name', 404));
    }
    res.status(200).json({
        status: 'success',
        conversations: conversation
    });
}));
//# sourceMappingURL=conversationController.js.map