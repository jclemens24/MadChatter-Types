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
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        minlength: [2, 'The first name must be at least 2 characters'],
        required: true
    },
    lastName: {
        type: String,
        minlength: [2, 'The last name must be at least 2 characters'],
        required: true
    },
    email: {
        type: String,
        required: [true, 'A user must have an email'],
        trim: true,
        validate: {
            validator: validator_1.default.isEmail,
            message: 'Email format must match test@example.com. {VALUE} is an invalid email'
        },
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'A password is required'],
        minlength: [8, 'A password must be at least 8 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (password) {
                return this.password === password;
            }
        }
    },
    profilePic: {
        type: String,
        default: 'default.jpg'
    },
    coverPic: {
        type: String,
        default: 'default.jpg'
    },
    photos: {
        type: [String]
    },
    followers: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    following: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number]
        },
        city: {
            type: String
        },
        state: {
            type: String
        }
    },
    birthYear: {
        type: Number
    },
    catchPhrase: {
        type: String,
        minlength: [1, 'A catch phrase must be at least 1 character'],
        maxlength: [150, 'A catch phrase cannot be longer than 150 characters'],
        trim: true,
        default: 'Say Something Clever'
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
userSchema.virtual('posts', {
    ref: 'Post',
    foreignField: 'toUser',
    localField: '_id'
});
userSchema.virtual('posts', {
    ref: 'Post',
    foreignField: 'fromUser',
    localField: '_id'
});
userSchema.index({ location: '2dsphere' });
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        this.password = yield bcryptjs_1.default.hash(this.password, 12);
        this.passwordConfirm = undefined;
        next();
    });
});
userSchema.methods.verifyPassword = function (candidatePass, userPass) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield bcryptjs_1.default.compare(candidatePass, userPass);
        return result;
    });
};
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=userModel.js.map