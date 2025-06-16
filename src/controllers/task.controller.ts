import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import Task from '../models/Task';

export class TaskController {
  // Create new task
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, status, due_date, project_id } = req.body;
      const creator_id = req.user!._id;
      const image_url = req.file ? (req.file as any).location : req.body.image_url;

      if (!image_url) {
        return res.status(400).json({
          success: false,
          message: 'Image URL is required',
        });
      }

      const task = await TaskService.create({
        title,
        status,
        due_date: new Date(due_date),
        image_url,
        project_id,
        creator_id: creator_id.toString(),
      });

      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
       return next(error);
    }
  }

  // Get task by ID
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const task = await TaskService.getById(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      return next(error);
    }
  }

  // Get tasks with filters
  static async getTasks(req: Request, res: Response, _next: NextFunction) {
    try {
      const { title, status, project_id, creator_id, page = 1, limit = 10 } = req.query;
      const query: any = {};

      // Build search query
      if (title) {
        // Decodifica o título da URL e remove espaços extras
        const decodedTitle = decodeURIComponent(title.toString()).trim();
        query.title = { $regex: `^${decodedTitle}$`, $options: 'i' };
      }
      if (status) {
        query.status = status;
      }
      if (project_id) {
        query.project_id = project_id;
      }
      if (creator_id) {
        query.creator_id = creator_id.toString();
      }

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      const total = await Task.countDocuments(query);

      const tasks = await Task.find(query)
        .skip(skip)
        .limit(Number(limit))
        .populate('creator_id', 'name email')
        .populate('project_id', 'name');

      res.status(200).json({
        success: true,
        data: {
          tasks,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching tasks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update task
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!._id;
      const { title, status, due_date } = req.body;
      const image_url = req.file ? (req.file as any).location : req.body.image_url;

      const updateData: any = {};
      if (title) updateData.title = title;
      if (status) updateData.status = status;
      if (due_date) updateData.due_date = new Date(due_date);
      if (image_url) updateData.image_url = image_url;

      const task = await TaskService.update(id, userId.toString(), updateData);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      return next(error);
    }
  }

  // Delete task
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      await TaskService.delete(id, userId.toString());

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
} 