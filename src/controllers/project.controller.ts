import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { ValidationError } from '../utils/errors';
import { IProject } from '../types/models';
import { Types } from 'mongoose';

export class ProjectController {
  // Get all projects
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectService.getAll();
      res.json(projects);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // Get project by ID
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getById(req.params.id);
      if (!project) {
        throw new ValidationError('Project not found');
      }
      res.json(project);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // Create new project
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
      res.status(201).json(project);
      return;
    } catch (error) {
      console.error('Error creating project:', error);
      next(error);
      return;
    }
  }

  // Update project
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getById(req.params.id) as IProject;
      if (!project) {
        throw new ValidationError('Project not found');
      }

      // Check if user is owner or collaborator
      if (
        (project.creator_id as Types.ObjectId).toString() !== req.user._id &&
        !project.collaborators.some(id => (id as Types.ObjectId).toString() === req.user._id)
      ) {
        throw new ValidationError('Not authorized to update this project');
      }

      const updatedProject = await ProjectService.update(req.params.id, req.body);
      res.json(updatedProject);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // Delete project
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getById(req.params.id) as IProject;
      if (!project) {
        throw new ValidationError('Project not found');
      }

      // Check if user is owner
      if ((project.creator_id as Types.ObjectId).toString() !== req.user._id) {
        throw new ValidationError('Not authorized to delete this project');
      }

      await ProjectService.delete(req.params.id);
      res.status(204).send();
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // Add collaborator to project
  static async addCollaborator(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getById(req.params.id) as IProject;
      if (!project) {
        throw new ValidationError('Project not found');
      }

      // Check if user is owner
      if ((project.creator_id as Types.ObjectId).toString() !== req.user._id) {
        throw new ValidationError('Not authorized to add collaborators to this project');
      }

      const updatedProject = await ProjectService.addCollaborator(
        req.params.id,
        req.body.collaborator_id
      );
      res.json(updatedProject);
      return;
    } catch (error) {
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
      const project = await ProjectService.getById(req.params.id) as IProject;
      if (!project) {
        throw new ValidationError('Project not found');
      }

      // Check if user is owner
      if ((project.creator_id as Types.ObjectId).toString() !== req.user._id) {
        throw new ValidationError('Not authorized to remove collaborators from this project');
      }

      const updatedProject = await ProjectService.removeCollaborator(
        req.params.id,
        req.params.collaboratorId
      );
      res.json(updatedProject);
      return;
    } catch (error) {
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
      res.json(collaborators);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
} 