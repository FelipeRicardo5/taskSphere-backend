import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { uploaders } from '../config/cloudinary';

const router = Router();

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     tags: [Upload]
 *     summary: Upload an avatar image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 */
router.post('/avatar', authenticate, uploaders.avatar.single('image'), UploadController.uploadAvatar);

/**
 * @swagger
 * /api/upload/project:
 *   post:
 *     tags: [Upload]
 *     summary: Upload a project image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Project image uploaded successfully
 */
router.post('/project', authenticate, uploaders.project.single('image'), UploadController.uploadProjectImage);

/**
 * @swagger
 * /api/upload/task:
 *   post:
 *     tags: [Upload]
 *     summary: Upload a task image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Task image uploaded successfully
 */
router.post('/task', authenticate, uploaders.task.single('image'), UploadController.uploadTaskImage);

/**
 * @swagger
 * /api/upload/image/{public_id}:
 *   delete:
 *     tags: [Upload]
 *     summary: Delete an uploaded image
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: public_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Image not found
 */
router.delete('/image/:public_id', authenticate, UploadController.deleteImage);

/**
 * @swagger
 * /api/upload/image/{public_id}:
 *   get:
 *     tags: [Upload]
 *     summary: Get image URL by public ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: public_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image URL retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Image not found
 */
router.get('/image/:public_id', authenticate, UploadController.getImageUrl);

export default router; 