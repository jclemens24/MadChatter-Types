"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const appError_1 = require("../utils/appError");
const multerMemory = multer_1.default.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        cb(null, false);
        cb(new appError_1.AppError('You may only upload images', 404));
    }
};
exports.upload = (0, multer_1.default)({
    storage: multerMemory,
    fileFilter: multerFilter
});
//# sourceMappingURL=fileUpload.js.map