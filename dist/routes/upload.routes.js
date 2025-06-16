"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const auth_1 = require("../middleware/auth");
const cloudinary_1 = require("../config/cloudinary");
const router = (0, express_1.Router)();
router.post('/avatar', auth_1.authenticate, cloudinary_1.uploaders.avatar.single('image'), upload_controller_1.UploadController.uploadAvatar);
router.post('/project', auth_1.authenticate, cloudinary_1.uploaders.project.single('image'), upload_controller_1.UploadController.uploadProjectImage);
router.post('/task', auth_1.authenticate, cloudinary_1.uploaders.task.single('image'), upload_controller_1.UploadController.uploadTaskImage);
router.delete('/image/:public_id', auth_1.authenticate, upload_controller_1.UploadController.deleteImage);
router.get('/image/:public_id', auth_1.authenticate, upload_controller_1.UploadController.getImageUrl);
exports.default = router;
//# sourceMappingURL=upload.routes.js.map