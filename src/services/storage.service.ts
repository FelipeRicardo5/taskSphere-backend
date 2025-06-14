import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { BadRequestError } from '../utils/errors';

class StorageService {
  private s3Client: S3Client | null = null;
  private useCloudinary: boolean;

  constructor() {
    this.useCloudinary = Boolean(
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
    );

    if (this.useCloudinary) {
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
      });
    } else if (
      env.AWS_ACCESS_KEY_ID &&
      env.AWS_SECRET_ACCESS_KEY &&
      env.AWS_REGION &&
      env.AWS_S3_BUCKET
    ) {
      this.s3Client = new S3Client({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      });
    } else {
      throw new Error('No storage configuration found');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      if (this.useCloudinary) {
        return await this.uploadToCloudinary(file);
      } else {
        return await this.uploadToS3(file);
      }
    } catch (error) {
      throw new BadRequestError('Failed to upload file');
    }
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result?.secure_url || '');
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  private async uploadToS3(file: Express.Multer.File): Promise<string> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const key = `uploads/${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.public_read,
    });

    await this.s3Client.send(command);

    return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }
}

export const storageService = new StorageService(); 