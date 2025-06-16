"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploaders = exports.storages = void 0;
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
const env_1 = require("./env");
cloudinary_1.v2.config({
    cloud_name: env_1.env.CLOUDINARY_CLOUD_NAME,
    api_key: env_1.env.CLOUDINARY_API_KEY,
    api_secret: env_1.env.CLOUDINARY_API_SECRET
});
const uploadConfigs = {
    avatar: {
        folder: 'tasksphere/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 200, height: 200, crop: 'fill' }]
    },
    project: {
        folder: 'tasksphere/projects',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    },
    task: {
        folder: 'tasksphere/tasks',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
};
exports.storages = {
    avatar: new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.v2,
        params: {
            ...uploadConfigs.avatar,
            resource_type: 'auto'
        }
    }),
    project: new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.v2,
        params: {
            ...uploadConfigs.project,
            resource_type: 'auto'
        }
    }),
    task: new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.v2,
        params: {
            ...uploadConfigs.task,
            resource_type: 'auto'
        }
    })
};
const multerConfig = {
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
};
exports.uploaders = {
    avatar: (0, multer_1.default)({
        storage: exports.storages.avatar,
        ...multerConfig
    }),
    project: (0, multer_1.default)({
        storage: exports.storages.project,
        ...multerConfig
    }),
    task: (0, multer_1.default)({
        storage: exports.storages.task,
        ...multerConfig
    })
};
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map