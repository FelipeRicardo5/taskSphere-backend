import { ITask } from '../models/Task';
import Task from '../models/Task';
import Project from '../models/Project';
import { BadRequestError } from '../utils/errors';

interface TaskFilters {
  title?: string;
  status?: 'todo' | 'in_progress' | 'done';
  project_id?: string;
  page?: number;
  limit?: number;
}

interface PaginatedTasks {
  tasks: ITask[];
  total: number;
  page: number;
  totalPages: number;
}

export class TaskService {
  // Create new task
  static async create(taskData: {
    title: string;
    status: 'todo' | 'in_progress' | 'done';
    due_date: Date;
    image_url: string;
    project_id: string;
    creator_id: string;
  }): Promise<ITask> {
    // Verify project exists and user is a collaborator
    const project = await Project.findById(taskData.project_id);
    if (!project) {
      throw new Error('Project not found');
    }

    const creatorId = project.creator_id;
    if (
      creatorId.toString() !== taskData.creator_id &&
      !project.collaborators.some(id => id.toString() === taskData.creator_id)
    ) {
      throw new Error('Not authorized to create tasks in this project');
    }

    const task = await Task.create(taskData);
    return task;
  }

  // Get task by ID
  static async getById(taskId: string): Promise<ITask | null> {
    return Task.findById(taskId)
      .populate('project_id', 'name')
      .populate('creator_id', 'name email');
  }

  // Get tasks with filters and pagination
  static async getTasks(filters: TaskFilters): Promise<PaginatedTasks> {
    const { title, status, project_id, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (project_id) {
      query.project_id = project_id;
    }

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ created_at: -1 })
        .populate('creator_id', 'name email')
        .populate('project_id', 'name'),
      Task.countDocuments(query),
    ]);

    return {
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Update task
  static async update(
    taskId: string,
    userId: string,
    updateData: Partial<ITask>
  ): Promise<ITask | null> {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Get project to check permissions
    const project = await Project.findById(task.project_id);
    if (!project) {
      throw new Error('Project not found');
    }

    const creatorId = project.creator_id;
    const taskCreatorId = task.creator_id;

    // Only task creator or project creator can update
    if (
      taskCreatorId.toString() !== userId &&
      creatorId.toString() !== userId
    ) {
      throw new Error('Not authorized to update this task');
    }

    return Task.findByIdAndUpdate(taskId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('project_id', 'name')
      .populate('creator_id', 'name email');
  }

  // Delete task
  static async delete(taskId: string, userId: string): Promise<void> {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Get project to check permissions
    const project = await Project.findById(task.project_id);
    if (!project) {
      throw new Error('Project not found');
    }

    const creatorId = project.creator_id;
    const taskCreatorId = task.creator_id;

    // Only task creator or project creator can delete
    if (
      taskCreatorId.toString() !== userId &&
      creatorId.toString() !== userId
    ) {
      throw new Error('Not authorized to delete this task');
    }

    await task.deleteOne();
  }

  async validateTaskDates(dueDate: Date): Promise<void> {
    if (dueDate < new Date()) {
      throw new BadRequestError('Due date must be in the future');
    }
  }
} 