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
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    toUser: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A post must be sent to a user']
    },
    fromUser: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A post must be sent from a user']
    },
    desc: {
        type: String,
        maxlength: 500
    },
    image: {
        type: String,
        default: null
    },
    likes: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
            default: [],
            unique: false
        }
    ]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
postSchema.pre(/^find/, function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        this.populate([
            {
                path: 'toUser',
                select: '-__v -passwordConfirm -email -coverPic -followers -following -birthYear -photos -catchPhrase -location',
                options: { _recursed: true }
            },
            {
                path: 'fromUser',
                select: '-__v -passwordConfirm -email -coverPic -followers -following -birthYear -photos -catchPhrase -location'
            }
        ]);
        next();
    });
});
postSchema.virtual('comments', {
    ref: 'Comment',
    foreignField: 'post',
    localField: '_id'
});
postSchema.post('save', (doc, next) => {
    doc
        .populate(['toUser', 'fromUser'])
        .then(() => {
        next();
    });
});
postSchema.post(/^create/, function (next) {
    this.populate({
        path: 'comments',
        options: {
            _recursed: true
        }
    });
    next();
});
const Post = mongoose_1.default.model('Post', postSchema);
exports.default = Post;
//# sourceMappingURL=postModel.js.map