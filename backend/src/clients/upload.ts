import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';
import { r2, s3 } from './s3.js';

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
        const fileName = `${req.uploadKey}/input.${fileExtension}`;
        cb(null, fileName);
      },
    }),
    limits: { fileSize: 200 * 1024 * 1024 },
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (fileType === 'video' && file.mimetype === 'video/mp4') {
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
[
  {
    messageId: '5d25af24-f0f4-4adb-8d38-7a51f2de299a',
    receiptHandle: 'AQEBtkarJu3e9PizGC1dS+7ikLwagw3VuhI9mrv+5+l3tqhMycO5rp2vzziOd5xIX+b0G7QTm41b7Bp1CPX3UYUXv4ufoE++BLO7e2+oT62K3AlfiabGPe7zM2HnBte3DBOMjxygLHS0ynjTqderwfhvJKvO4R77gFPRGl5HgOqmkZMYNtO5UobbpVx9Mg2r2kqtzJlHet+xIrMQf2k2MVkcmGefsaY0LOIfGoa+5HyoS2zeFm/oc0QdpyQTSV9Vdp4dQ2q6vPpklUlAeNWYouMBbSRWAC9xZvzYhC4FsJQtZsf4tMT+3yEDHcoO2O3t6IW0PLGwfxNm5XkW3wjDOyLPgPafVQh6TBKtlpp4JcwHF0WslDk8zWzVGN4KpqYxFfeD',
    body: '{"Records":[{"eventVersion":"2.1","eventSource":"aws:s3","awsRegion":"ap-south-1","eventTime":"2024-11-12T04:40:38.678Z","eventName":"ObjectCreated:Put","userIdentity":{"principalId":"AODXXEZ9L38J9"},"requestParameters":{"sourceIPAddress":"49.36.202.157"},"responseElements":{"x-amz-request-id":"7FWQ6GNH634WM29C","x-amz-id-2":"/Qv//q5B/WBuaK3zsg8Ohs3i3G+OQLu2U/Fh1MzP58lGqKg0j/Hxt5rtLmHm/jyskSbCi/tAK6FZN+kIXmPMXnd1Cv46+BsnSZAc1PZRedU="},"s3":{"s3SchemaVersion":"1.0","configurationId":"e","bucket":{"name":"ecom-videos-temp","ownerIdentity":{"principalId":"AODXXEZ9L38J9"},"arn":"arn:aws:s3:::ecom-videos-temp"},"object":{"key":"p/","size":0,"eTag":"d41d8cd98f00b204e9800998ecf8427e","sequencer":"006732DC46A426AB44"}}}]}',
    attributes: [Object],
    messageAttributes: {},
    md5OfBody: 'fc685142bc2d8aed3134b7500314a550',
    eventSource: 'aws:sqs',
    eventSourceARN: 'arn:aws:sqs:ap-south-1:598046560354:video',
    awsRegion: 'ap-south-1'
  }
]
