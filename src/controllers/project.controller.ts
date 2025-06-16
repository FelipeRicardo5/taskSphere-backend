import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { ValidationError } from '../utils/errors';
import { IProject } from '../types/models';
import { Types } from 'mongoose';

interface PopulatedCreator {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

interface PopulatedProject extends Omit<IProject, 'creator_id' | 'collaborators'> {
  creator_id: PopulatedCreator;
  collaborators: PopulatedCreator[];
}

export class ProjectController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectService.getAll();
      res.json({
        success: true,
        data: projects
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getById(req.params.id);
      if (!project) {
        throw new ValidationError('Project not found');
      }

      // Verificar se o projeto está populado corretamente
      if (!project.creator_id || typeof project.creator_id === 'string' || !('_id' in project.creator_id)) {
        throw new ValidationError('Project data is not properly populated');
      }

      res.json({
        success: true,
        data: project
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Creating project with data:', req.body);
      const project = await ProjectService.create({
        name: req.body.name,
        description: req.body.description,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        creator_id: req.user._id
      });
      res.status(201).json({
        success: true,
        data: project
      });
      return;
    } catch (error) {
      console.error('Error creating project:', error);
      next(error);
      return;
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Update Project - User ID:', req.user._id);
      console.log('Update Project - Project ID:', req.params.id);

      const project = await ProjectService.getById(req.params.id);
      if (!project) {
        throw new ValidationError('Project not found');
      }

      // Verificar se o projeto está populado corretamente
      if (!project.creator_id || typeof project.creator_id === 'string' || !('_id' in project.creator_id)) {
        throw new ValidationError('Project data is not properly populated');
      }

      const creatorId = project.creator_id._id;
      const userId = req.user._id;

      console.log('Project found:', {
        creator_id: creatorId.toString(),
        user_id: userId.toString(),
        isCreator: creatorId.toString() === userId.toString(),
        collaborators: project.collaborators
      });

      // Check if user is owner or collaborator
      if (
        creatorId.toString() !== userId.toString() &&
        !project.collaborators.some(collab => 
          typeof collab === 'object' && '_id' in collab && 
          collab._id.toString() === userId.toString()
        )
      ) {
        throw new ValidationError('Not authorized to update this project');
      }

      const updatedProject = await ProjectService.update(req.params.id, req.body);
      res.json({
        success: true,
        data: updatedProject
      });
      return;
    } catch (error) {
      console.error('Error in update project:', error);
      next(error);
      return;
    }
  }

  // Delete project
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Delete Project - User ID:', req.user._id);
      console.log('Delete Project - Project ID:', req.params.id);

      const project = await ProjectService.getById(req.params.id);
      if (!project) {
        throw new ValidationError('Project not found');
      }

      // Verificar se o projeto está populado corretamente
      if (!project.creator_id || typeof project.creator_id === 'string' || !('_id' in project.creator_id)) {
        throw new ValidationError('Project data is not properly populated');
      }

      const creatorId = project.creator_id._id;
      const userId = req.user._id;

      console.log('Project found:', {
        creator_id: creatorId.toString(),
        user_id: userId.toString(),
        isCreator: creatorId.toString() === userId.toString()
      });

      // Check if user is owner
      if (creatorId.toString() !== userId.toString()) {
        throw new ValidationError('Not authorized to delete this project');
      }

      await ProjectService.delete(req.params.id);
      res.status(204).send();
      return;
    } catch (error) {
      console.error('Error in delete project:', error);
      next(error);
      return;
    }
  }

  // Add collaborator to project
  static async addCollaborator(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getById(req.params.id);
      if (!project) {
        throw new ValidationError('Project not found');
      }

      // Verificar se o projeto está populado corretamente
      if (!project.creator_id || typeof project.creator_id === 'string' || !('_id' in project.creator_id)) {
        throw new ValidationError('Project data is not properly populated');
      }

      const creatorId = project.creator_id._id;
      const userId = req.user._id;

      // Check if user is owner
      if (creatorId.toString() !== userId.toString()) {
        throw new ValidationError('Not authorized to add collaborators to this project');
      }

      const updatedProject = await ProjectService.addCollaborator(
        req.params.id,
        req.body.collaborator_id
      );
      res.json({
        success: true,
        data: updatedProject
      });
      return;
    } catch (error) {
      console.error('Error adding collaborator:', error);
      next(error);
      return;
    }
  }

  // Remove collaborator from project
  static async removeCollaborator(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const project = await ProjectService.getById(req.params.id);
      if (!project) {
        throw new ValidationError('Project not found');
      }

      // Verificar se o projeto está populado corretamente
      if (!project.creator_id || typeof project.creator_id === 'string' || !('_id' in project.creator_id)) {
        throw new ValidationError('Project data is not properly populated');
      }

      const creatorId = project.creator_id._id;
      const userId = req.user._id;

      // Check if user is owner
      if (creatorId.toString() !== userId.toString()) {
        throw new ValidationError('Not authorized to remove collaborators from this project');
      }

      const updatedProject = await ProjectService.removeCollaborator(
        req.params.id,
        req.params.collaboratorId
      );
      res.json({
        success: true,
        data: updatedProject
      });
      return;
    } catch (error) {
      console.error('Error removing collaborator:', error);
      next(error);
      return;
    }
  }

  // Get project collaborators
  static async getCollaborators(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const collaborators = await ProjectService.getCollaborators(_req.params.id);
      res.json({
        success: true,
        data: collaborators
      });
      return;
    } catch (error) {
      console.error('Error getting collaborators:', error);
      next(error);
      return;
    }
  }
} 