"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const errors_1 = require("../utils/errors");
class UploadService {
    static async uploadImage(file, type) {
        try {
            if (!file) {
                throw new errors_1.BadRequestError('No file uploaded');
            }
            if (file.path) {
                return {
                    url: file.path,
                    public_id: file.filename
                };
            }
            if (file.buffer) {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary_1.default.uploader.upload_stream({
                        folder: `tasksphere/${type}s`,
                        resource_type: 'auto',
                        transformation: type === 'avatar'
                            ? [{ width: 200, height: 200, crop: 'fill' }]
                            : [{ width: 1000, height: 1000, crop: 'limit' }]
                    }, (error, result) => {
                        if (error) {
                            reject(new Error(`Failed to upload ${type} image: ${error.message}`));
                        }
                        else if (!result) {
                            reject(new Error(`Failed to upload ${type} image: No result from Cloudinary`));
                        }
                        else {
                            resolve({
                                url: result.secure_url,
                                public_id: result.public_id
                            });
                        }
                    });
                    uploadStream.end(file.buffer);
                });
            }
            throw new errors_1.BadRequestError('Invalid file format');
        }
        catch (error) {
            console.error('Upload service error:', error);
            throw new Error(`Failed to upload ${type} image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    static async deleteImage(public_id) {
        try {
            const result = await cloudinary_1.default.uploader.destroy(public_id);
            if (result.result !== 'ok') {
                throw new Error('Failed to delete image');
            }
            return true;
        }
        catch (error) {
            throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    static async getImageUrl(public_id) {
        try {
            const result = await cloudinary_1.default.api.resource(public_id);
            return result.secure_url;
        }
        catch (error) {
            throw new Error(`Failed to get image URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.UploadService = UploadService;
//# sourceMappingURL=upload.service.js.map