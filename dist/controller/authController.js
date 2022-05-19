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
exports.verifyAuth = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../model/userModel"));
const postModel_1 = __importDefault(require("../model/postModel"));
const commentsModel_1 = __importDefault(require("../model/commentsModel"));
const appError_1 = require("../utils/appError");
const catchAsync_1 = require("../utils/catchAsync");
const location_1 = __importDefault(require("../utils/location"));
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};
exports.signup = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const coordinates = yield (0, location_1.default)(`${req.body.city} ${req.body.state}, ${req.body.zip}`);
    if (!coordinates)
        return next(new appError_1.AppError('Unable to retrieve those coordinates', 404));
    const newUser = yield userModel_1.default.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        location: {
            coordinates: [coordinates.lng, coordinates.lat],
            city: req.body.city,
            state: req.body.state
        },
        birthYear: req.body.birthYear
    });
    const posts = yield postModel_1.default.find({ toUser: newUser._id });
    const token = signToken(newUser._id);
    newUser.password = undefined;
    res.status(200).json({
        status: 'success',
        user: newUser,
        posts,
        token
    });
}));
exports.login = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
        return next(new appError_1.AppError('Please provide your login email and password or go sign up', 404));
    }
    const user = yield userModel_1.default.findOne({ email })
        .select('+password')
        .populate({ path: 'following', strictPopulate: false });
    if (!user ||
        !(yield user.verifyPassword(password, user.password))) {
        return next(new appError_1.AppError('Incorrect credentials. Please check your credentials and try again', 401));
    }
    const posts = yield postModel_1.default.find({ toUser: user._id }).populate({
        path: 'comments',
        select: 'post comment',
        model: commentsModel_1.default
    });
    const token = signToken(user._id);
    user.password = undefined;
    res.status(200).json({
        status: 'success',
        user,
        token,
        posts
    });
}));
exports.verifyAuth = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else {
        token = undefined;
    }
    if (typeof token === 'undefined') {
        return next(new appError_1.AppError('Oops! Access is Forbidden. Please login.', 401));
    }
    const decodedJWT = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const authorizedUser = yield userModel_1.default.findById(decodedJWT.id);
    if (!authorizedUser) {
        return next(new appError_1.AppError('User belonging to this token does not exist', 401));
    }
    else {
        req.user = authorizedUser;
        res.locals.user = authorizedUser;
        next();
    }
}));
//# sourceMappingURL=authController.js.map