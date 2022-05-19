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
exports.createMessage = exports.getChatroomMessages = void 0;
const messageModel_1 = __importDefault(require("../model/messageModel"));
const conversationModel_1 = __importDefault(require("../model/conversationModel"));
const appError_1 = require("../utils/appError");
const catchAsync_1 = require("../utils/catchAsync");
exports.getChatroomMessages = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield messageModel_1.default.find({ conversationId: req.params.chatId });
    if (!messages) {
        return next(new appError_1.AppError('Cannot find any messages', 400));
    }
    res.status(200).json({
        status: 'success',
        messages
    });
}));
exports.createMessage = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationExists = yield conversationModel_1.default.find({
        _id: req.body.conversationId
    });
    if (conversationExists) {
        const addMessages = yield messageModel_1.default.create({
            sender: req.body.sender,
            text: req.body.text,
            conversationId: req.body.conversationId
        });
        const message = yield messageModel_1.default.findOne({ _id: addMessages._id });
        res.status(200).json({
            status: 'success',
            messages: message
        });
    }
    else {
        const conversation = yield conversationModel_1.default.create({
            members: [req.body.sender, req.body.reciever]
        });
        const message = yield messageModel_1.default.create({
            sender: req.body.sender,
            text: req.body.text,
            conversationId: conversation._id
        });
        res.status(200).json({
            status: 'success',
            messages: message
        });
    }
}));
//# sourceMappingURL=messageController.js.map