"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const upload_service_1 = require("../services/upload.service");
const errors_1 = require("../utils/errors");
class UploadController {
    static async uploadAvatar(req, res) {
        try {
            if (!req.file) {
                throw new errors_1.BadRequestError('No file uploaded');
            }
            const result = await upload_service_1.UploadService.uploadImage(req.file, 'avatar');
            return res.status(200).json({
                success: true,
                data: {
                    url: result.url,
                    public_id: result.public_id
                }
            });
        }
        catch (error) {
            console.error('Avatar upload error:', error);
            if (error instanceof errors_1.BadRequestError) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload avatar'
            });
        }
    }
    static async uploadProjectImage(req, res) {
        try {
            if (!req.file) {
                throw new errors_1.BadRequestError('No file uploaded');
            }
            const result = await upload_service_1.UploadService.uploadImage(req.file, 'project');
            return res.status(200).json({
                success: true,
                data: {
                    url: result.url,
                    public_id: result.public_id
                }
            });
        }
        catch (error) {
            console.error('Project image upload error:', error);
            if (error instanceof errors_1.BadRequestError) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload project image'
            });
        }
    }
    static async uploadTaskImage(req, res) {
        try {
            if (!req.file) {
                throw new errors_1.BadRequestError('No file uploaded');
            }
            console.log('Task image upload - File details:', {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            });
            const result = await upload_service_1.UploadService.uploadImage(req.file, 'task');
            console.log('Task image upload - Success:', result);
            return res.status(200).json({
                success: true,
                data: {
                    url: result.url,
                    public_id: result.public_id
                }
            });
        }
        catch (error) {
            console.error('Task image upload error:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            if (error instanceof errors_1.BadRequestError) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload task image'
            });
        }
    }
    static async deleteImage(req, res) {
        try {
            const { public_id } = req.params;
            if (!public_id) {
                throw new errors_1.BadRequestError('Public ID is required');
            }
            await upload_service_1.UploadService.deleteImage(public_id);
            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete image error:', error);
            res.status(error instanceof errors_1.BadRequestError ? 400 : 500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error deleting image'
            });
        }
    }
    static async getImageUrl(req, res) {
        try {
            const { public_id } = req.params;
            if (!public_id) {
                throw new errors_1.BadRequestError('Public ID is required');
            }
            const url = await upload_service_1.UploadService.getImageUrl(public_id);
            res.json({
                success: true,
                data: { url }
            });
        }
        catch (error) {
            console.error('Get image URL error:', error);
            res.status(error instanceof errors_1.BadRequestError ? 400 : 500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error getting image URL'
            });
        }
    }
}
exports.UploadController = UploadController;
//# sourceMappingURL=upload.controller.js.map