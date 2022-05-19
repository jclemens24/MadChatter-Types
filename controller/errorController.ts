import { AppError } from '../utils/appError';
import { NextFunction, Request, Response } from 'express';
import { ErrorRequestHandler } from 'express';
import { CastError, MongooseError, Error } from 'mongoose';
import { ErrorDescription } from 'mongodb';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

const handleCastErrorDB = (err: CastError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationError = (err: Error.ValidationError): AppError => {
  const errors = Object.values(err.errors)
    .map(msg => msg.message)
    .join('. ');

  const message = `Invalid input data. ${errors
    .charAt(0)
    .toUpperCase()}${errors.substring(1)}`;
  return new AppError(message, 400);
};

const handleDuplicateFields = (err: ErrorDescription): AppError => {
  const value = err.errmsg?.match(/\{(\s*?.*?)*?\}/);
  const message = `Duplicate field value: ${value} already exists.`;
  return new AppError(message, 400);
};

const handleJWTError = (err: JsonWebTokenError): AppError => {
  return new AppError(err.message, 401);
};

const handleJWTExpired = (err: TokenExpiredError): AppError => {
  return new AppError(`${err.message}. Expired at: ${err.expiredAt}`, 401);
};

export function errorController(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name === 'CastError') err = handleCastErrorDB(err);
  if (err.name === 'ValidationError') err = handleValidationError(err);
  if (err.code === 11000) err = handleDuplicateFields(err);
  if (err.name === 'JsonWebTokenError') err = handleJWTError(err);
  if (err.name === 'TokenExpiredError') err = handleJWTExpired(err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
}
