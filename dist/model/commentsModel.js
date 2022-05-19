"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    post: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'A comment must belong to a post']
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A comment must belong to a user']
    },
    comment: {
        type: String,
        required: [true, 'A comment must exist'],
        minlength: [3, 'A  comment must be at least 3 chars'],
        maxlength: [1000, 'A comment cannot be longer than 1000 chars'],
        trim: true
    },
    reactions: {
        thumbsUp: {
            type: Number,
            default: 0
        },
        heart: {
            type: Number,
            default: 0
        },
        rocket: {
            type: Number,
            default: 0
        },
        eyes: {
            type: Number,
            default: 0
        },
        lol: {
            type: Number,
            default: 0
        },
        hooray: {
            type: Number,
            default: 0
        },
        angryFace: {
            type: Number,
            default: 0
        },
        sadFace: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
commentSchema.pre(/find/, function (next) {
    this.populate({
        path: 'user',
        select: '-__v -location -email -coverPic -followers -following -birthYear -photos -catchPhrase'
    });
    next();
});
commentSchema.post('save', (doc, next) => {
    doc
        .populate({
        path: 'user',
        select: '-__v -location -email -coverPic -followers -following -birthYear -photos -catchPhrase'
    })
        .then(() => {
        next();
    });
});
const Comment = mongoose_1.default.model('Comment', commentSchema);
exports.default = Comment;
//# sourceMappingURL=commentsModel.js.map