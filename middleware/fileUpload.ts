import multer, { FileFilterCallback } from 'multer';
import { AppError } from '../utils/appError';
import { Request } from 'express';

const multerMemory = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(null, false);
    cb(new AppError('You may only upload images', 404));
  }
};

export const upload = multer({
  storage: multerMemory,
  fileFilter: multerFilter
});
