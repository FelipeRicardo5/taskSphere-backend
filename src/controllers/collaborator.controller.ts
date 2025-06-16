import { Request, Response } from 'express';
import { CollaboratorService } from '../services/collaborator.service';
import { ProjectService } from '../services/project.service';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

export class CollaboratorController {
  static async getSuggestedCollaborators(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const suggestions = await CollaboratorService.getSuggestedCollaborators(limit);

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching suggested collaborators',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async addCollaborator(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Validate request body
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new BadRequestError('Request body is required');
      }

      if (!email) {
        throw new BadRequestError('Email is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestError('Invalid email format');
      }

      // Check for extra fields
      const allowedFields = ['email'];
      const extraFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
      if (extraFields.length > 0) {
        throw new BadRequestError(`Extra fields not allowed: ${extraFields.join(', ')}`);
      }

      const project = await ProjectService.addCollaboratorToUser(id, userId.toString(), email);
      return res.status(200).json(project);
    } catch (error) {
      if (error instanceof BadRequestError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof UnauthorizedError) {
        return res.status(401).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to add collaborator' });
    }
  }

  static async removeCollaborator(req: Request, res: Response) {
    try {
      const { id, collaboratorId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const project = await ProjectService.removeCollaboratorFromUser(id, userId.toString(), collaboratorId);
      return res.status(200).json(project);
    } catch (error) {
      if (error instanceof BadRequestError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof UnauthorizedError) {
        return res.status(401).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to remove collaborator' });
    }
  }
} 