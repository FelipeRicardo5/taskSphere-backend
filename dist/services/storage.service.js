"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const cloudinary_1 = require("cloudinary");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
class StorageService {
    constructor() {
        this.s3Client = null;
        this.useCloudinary = Boolean(env_1.env.CLOUDINARY_CLOUD_NAME &&
            env_1.env.CLOUDINARY_API_KEY &&
            env_1.env.CLOUDINARY_API_SECRET);
        if (this.useCloudinary) {
            cloudinary_1.v2.config({
                cloud_name: env_1.env.CLOUDINARY_CLOUD_NAME,
                api_key: env_1.env.CLOUDINARY_API_KEY,
                api_secret: env_1.env.CLOUDINARY_API_SECRET,
            });
        }
        else if (env_1.env.AWS_ACCESS_KEY_ID &&
            env_1.env.AWS_SECRET_ACCESS_KEY &&
            env_1.env.AWS_REGION &&
            env_1.env.AWS_S3_BUCKET) {
            this.s3Client = new client_s3_1.S3Client({
                region: env_1.env.AWS_REGION,
                credentials: {
                    accessKeyId: env_1.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: env_1.env.AWS_SECRET_ACCESS_KEY,
                },
            });
        }
        else {
            throw new Error('No storage configuration found');
        }
    }
    async uploadFile(file) {
        try {
            if (this.useCloudinary) {
                return await this.uploadToCloudinary(file);
            }
            else {
                return await this.uploadToS3(file);
            }
        }
        catch (error) {
            throw new errors_1.BadRequestError('Failed to upload file');
        }
    }
    async uploadToCloudinary(file) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                resource_type: 'auto',
            }, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve((result === null || result === void 0 ? void 0 : result.secure_url) || '');
                }
            });
            uploadStream.end(file.buffer);
        });
    }
    async uploadToS3(file) {
        if (!this.s3Client) {
            throw new Error('S3 client not initialized');
        }
        const key = `uploads/${Date.now()}-${file.originalname}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: env_1.env.AWS_S3_BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: client_s3_1.ObjectCannedACL.public_read,
        });
        await this.s3Client.send(command);
        return `https://${env_1.env.AWS_S3_BUCKET}.s3.${env_1.env.AWS_REGION}.amazonaws.com/${key}`;
    }
}
exports.storageService = new StorageService();
//# sourceMappingURL=storage.service.js.map