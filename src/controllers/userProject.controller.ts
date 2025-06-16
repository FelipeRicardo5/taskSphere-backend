import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { ValidationError } from '../utils/errors';

export class UserProjectController {
  /**
   * Get all projects where the user is either creator or collaborator
   * @param req Request object containing user information
   * @param res Response object
   * @param next Next function for error handling
   */
  static async getUserProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user._id;
      
      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const projects = await ProjectService.getByUser(userId.toString());

      res.json({
        success: true,
        data: {
          projects,
          total: projects.length
        }
      });
      return;
    } catch (error) {
      console.error('Error getting user projects:', error);
      next(error);
      return;
    }
  }

  /**
   * Get projects where user is creator
   * @param req Request object containing user information
   * @param res Response object
   * @param next Next function for error handling
   */
  static async getCreatedProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user._id;
      
      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const projects = await ProjectService.getByUser(userId.toString());
      const createdProjects = projects.filter(project => 
        project.creator_id._id.toString() === userId.toString()
      );

      res.json({
        success: true,
        data: {
          projects: createdProjects,
          total: createdProjects.length
        }
      });
      return;
    } catch (error) {
      console.error('Error getting created projects:', error);
      next(error);
      return;
    }
  }

  /**
   * Get projects where user is collaborator
   * @param req Request object containing user information
   * @param res Response object
   * @param next Next function for error handling
   */
  static async getCollaboratedProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user._id;
      
      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const projects = await ProjectService.getByUser(userId.toString());
      const collaboratedProjects = projects.filter(project => 
        project.collaborators.some(collab => 
          collab._id.toString() === userId.toString()
        )
      );

      res.json({
        success: true,
        data: {
          projects: collaboratedProjects,
          total: collaboratedProjects.length
        }
      });
      return;
    } catch (error) {
      console.error('Error getting collaborated projects:', error);
      next(error);
      return;
    }
  }
} 