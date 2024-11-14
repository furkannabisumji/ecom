import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';
import { r2, s3 } from './s3.js';
import { v4 } from 'uuid';

interface UploadOptions {
  destination: 's3' | 'r2';
  fileType: 'video' | 'image';
}

export const uploadToStorage = ({ destination, fileType }: UploadOptions) => {
  const storageService = destination === 's3' ? s3 : r2;
  const bucket = process.env[destination === 's3' ? 'TEMP_BUCKET' : 'BUCKET'] as string || 'none';

  return multer({
    storage: multerS3({
      s3: storageService,
      bucket,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req: Request, file: Express.Multer.File, cb: (error: Error | null, key?: string) => void) => {
        const fileExtension = file.mimetype.split('/')[1];
        const uploadKey = v4();
        const fileName =  fileType=='image' ? `images/${uploadKey}/input.${fileExtension}` : `${uploadKey}/input.${fileExtension}`;
        req.uploadKey = fileName;
        cb(null, fileName);
      },
    }),
    limits: { fileSize: 200 * 1024 * 1024 },
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (fileType === 'video' && file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else if (fileType === 'image' && file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error(`Only ${fileType}s are allowed`));
      }
    },
  });
};

export const uploadInS3 = uploadToStorage({ destination: 's3', fileType: 'video' });
export const uploadInR2 = uploadToStorage({ destination: 'r2', fileType: 'image' });