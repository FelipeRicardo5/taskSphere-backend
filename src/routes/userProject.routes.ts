import express from 'express';
import { UserProjectController } from '../controllers/userProject.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/user/projects:
 *   get:
 *     tags: [User Projects]
 *     summary: Get all projects where user is creator or collaborator
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's projects
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
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *                     total:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/projects', authenticate, UserProjectController.getUserProjects);

/**
 * @swagger
 * /api/user/projects/created:
 *   get:
 *     tags: [User Projects]
 *     summary: Get projects where user is creator
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects created by user
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
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *                     total:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/projects/created', authenticate, UserProjectController.getCreatedProjects);

/**
 * @swagger
 * /api/user/projects/collaborated:
 *   get:
 *     tags: [User Projects]
 *     summary: Get projects where user is collaborator
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects where user is collaborator
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
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *                     total:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/projects/collaborated', authenticate, UserProjectController.getCollaboratedProjects);

export default router; 