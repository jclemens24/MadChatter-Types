"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const conversationSchema = new mongoose_1.default.Schema({
    members: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        getters: true
    },
    toObject: {
        virtuals: true
    }
});
conversationSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'members',
        select: '-__v -passwordConfirm -following -followers -photos -location -birthYear -coverPic'
    });
    next();
});
const Conversation = mongoose_1.default.model('Conversation', conversationSchema);
exports.default = Conversation;
//# sourceMappingURL=conversationModel.js.map