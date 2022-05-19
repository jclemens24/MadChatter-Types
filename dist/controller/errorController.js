"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorController = void 0;
const appError_1 = require("../utils/appError");
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new appError_1.AppError(message, 400);
};
const handleValidationError = (err) => {
    const errors = Object.values(err.errors)
        .map(msg => msg.message)
        .join('. ');
    const message = `Invalid input data. ${errors
        .charAt(0)
        .toUpperCase()}${errors.substring(1)}`;
    return new appError_1.AppError(message, 400);
};
const handleDuplicateFields = (err) => {
    var _a;
    const value = (_a = err.errmsg) === null || _a === void 0 ? void 0 : _a.match(/\{(\s*?.*?)*?\}/);
    const message = `Duplicate field value: ${value} already exists.`;
    return new appError_1.AppError(message, 400);
};
const handleJWTError = (err) => {
    return new appError_1.AppError(err.message, 401);
};
const handleJWTExpired = (err) => {
    return new appError_1.AppError(`${err.message}. Expired at: ${err.expiredAt}`, 401);
};
function errorController(err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (err.name === 'CastError')
        err = handleCastErrorDB(err);
    if (err.name === 'ValidationError')
        err = handleValidationError(err);
    if (err.code === 11000)
        err = handleDuplicateFields(err);
    if (err.name === 'JsonWebTokenError')
        err = handleJWTError(err);
    if (err.name === 'TokenExpiredError')
        err = handleJWTExpired(err);
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
}
exports.errorController = errorController;
//# sourceMappingURL=errorController.js.map