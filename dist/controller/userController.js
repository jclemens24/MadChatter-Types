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
exports.handleUserSearch = exports.deleteUserPhoto = exports.uploadCoverPhoto = exports.uploadUserPhoto = exports.resizeUserCoverPhoto = exports.resizeUserPhoto = exports.setUserCoverPhoto = exports.setUserPhoto = exports.getUserPhotos = exports.suggestFriends = exports.getAUserProfile = exports.unfollowAndFollowAFriend = exports.validateAUser = void 0;
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const userModel_1 = __importDefault(require("../model/userModel"));
const postModel_1 = __importDefault(require("../model/postModel"));
const appError_1 = require("../utils/appError");
const catchAsync_1 = require("../utils/catchAsync");
exports.validateAUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const user = yield userModel_1.default.findById(userId).populate('followers').populate({
        path: 'following',
        select: '-__v -birthYear -catchPhrase -email -following -followers -coverPic -location -photos'
    });
    if (!user) {
        return next(new appError_1.AppError('User could not be found. Please login.', 404));
    }
    const posts = yield postModel_1.default.find({ toUser: userId }).populate({
        path: 'comments'
    });
    req.user = user;
    res.status(200).send({
        status: 'success',
        user,
        posts
    });
}));
exports.unfollowAndFollowAFriend = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const userFriend = req.body.id;
    if (!userId || !userFriend) {
        return next(new appError_1.AppError('Error processing this request. Please try again', 404));
    }
    if (req.query.unfollow) {
        const friend = yield userModel_1.default.findById(userFriend);
        yield userModel_1.default.findByIdAndUpdate({
            _id: userId
        }, {
            $pull: { following: userFriend }
        }, { new: true });
        res.status(200).json({
            status: 'success',
            user: friend
        });
    }
    else if (req.query.follow) {
        const friend = yield userModel_1.default.findById(userFriend);
        if (!friend)
            return next(new appError_1.AppError('This friend no longer exists', 400));
        const alreadyFriended = yield userModel_1.default.findById(userId).where({
            following: userFriend
        });
        if (alreadyFriended === null) {
            return next(new appError_1.AppError('You are already friends with this person', 404));
        }
        yield userModel_1.default.findByIdAndUpdate({ _id: userId }, { $push: { following: friend._id } }, { returnDocument: 'after' });
        res.status(200).json({
            status: 'success',
            user: friend
        });
    }
    else {
        return next();
    }
}));
exports.getAUserProfile = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!userId) {
        return next(new appError_1.AppError('User could not be found', 400));
    }
    const friend = yield userModel_1.default.findById(userId).populate('followers following');
    if (!friend) {
        return next(new appError_1.AppError('Could not find this profile', 400));
    }
    req.friend = friend;
    next();
}));
exports.suggestFriends = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { lnglat } = req.params;
    const [lng, lat] = lnglat.split(',');
    const multiplier = 0.0006213712;
    const nearbyUsers = yield userModel_1.default.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [parseInt(lng, 10), parseInt(lat, 10)]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
                maxDistance: 1000000
            }
        },
        {
            $project: {
                distance: true,
                firstName: true,
                lastName: true,
                profilePic: true
            }
        },
        { $limit: 10 }
    ]);
    res.status(200).json({
        status: 'success',
        users: nearbyUsers
    });
}));
exports.getUserPhotos = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const userPhotos = yield userModel_1.default.findById(userId, 'photos');
    if (!userPhotos) {
        return next(new appError_1.AppError('User has no photos', 400));
    }
    res.status(200).json({
        status: 'success',
        photos: userPhotos
    });
}));
exports.setUserPhoto = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const updatePhoto = yield userModel_1.default.findByIdAndUpdate(userId, { profilePic: req.body.photo }, {
        new: true
    });
    res.status(200).json({
        status: 'success',
        user: updatePhoto
    });
}));
exports.setUserCoverPhoto = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const updatePhoto = yield userModel_1.default.findByIdAndUpdate(req.user._id, { coverPic: req.params.pid }, { new: true });
    res.status(200).json({
        status: 'success',
        user: updatePhoto
    });
}));
exports.resizeUserPhoto = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return next();
    const filename = `user-${(0, uuid_1.v4)()}.jpeg`;
    req.file.filename = filename;
    yield (0, sharp_1.default)(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/${req.file.filename}`);
    next();
}));
exports.resizeUserCoverPhoto = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return next();
    const filename = `user-${(0, uuid_1.v4)()}.jpeg`;
    req.file.filename = filename;
    yield (0, sharp_1.default)(req.file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/${filename}`);
    next();
}));
exports.uploadUserPhoto = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const image = req.file.filename;
    const user = yield userModel_1.default.findByIdAndUpdate(req.user._id, {
        profilePic: image,
        $push: {
            photos: image
        }
    }, { new: true });
    if (!user || !user.profilePic) {
        return next(new appError_1.AppError('', 404));
    }
    res.status(200).json({
        status: 'success',
        photo: user.profilePic
    });
}));
exports.uploadCoverPhoto = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const image = req.file.filename;
    const user = yield userModel_1.default.findByIdAndUpdate(req.user._id, {
        coverPic: image,
        $push: {
            photos: image
        }
    }, { new: true });
    if (!user) {
        return next(new appError_1.AppError('Could not upload this image because the user does not exist', 404));
    }
    res.status(200).json({
        status: 'success',
        photo: user.coverPic
    });
}));
exports.deleteUserPhoto = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const photoName = req.params.pid;
    yield userModel_1.default.findByIdAndUpdate(req.user._id, {
        $pull: {
            photos: photoName
        }
    }, { new: true });
    fs_1.default.unlink(`${__dirname}/../public/images/${photoName}`, err => {
        if (err)
            return next(new appError_1.AppError('Could not delete that photo, try again', 404));
    });
    res.status(200).json({
        status: 'success',
        message: 'Photo has been deleted'
    });
}));
exports.handleUserSearch = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { filter } = req.query;
    console.log(filter);
    if (typeof filter === 'string') {
        const user = yield userModel_1.default.find({ firstName: filter });
        res.status(200).json({
            status: 'success',
            user
        });
    }
    else {
        return next(new appError_1.AppError('Error searching..', 404));
    }
}));
//# sourceMappingURL=userController.js.map