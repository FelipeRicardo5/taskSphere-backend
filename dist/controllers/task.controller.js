"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("../services/task.service");
const Task_1 = __importDefault(require("../models/Task"));
class TaskController {
    static async create(req, res, next) {
        try {
            const { title, status, due_date, project_id } = req.body;
            const creator_id = req.user._id;
            const image_url = req.file ? req.file.location : req.body.image_url;
            if (!image_url) {
                return res.status(400).json({
                    success: false,
                    message: 'Image URL is required',
                });
            }
            const task = await task_service_1.TaskService.create({
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
        }
        catch (error) {
            return next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const task = await task_service_1.TaskService.getById(id);
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
        }
        catch (error) {
            return next(error);
        }
    }
    static async getTasks(req, res, _next) {
        try {
            const { title, status, project_id, creator_id, page = 1, limit = 10 } = req.query;
            const query = {};
            if (title) {
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
            const skip = (Number(page) - 1) * Number(limit);
            const total = await Task_1.default.countDocuments(query);
            const tasks = await Task_1.default.find(query)
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching tasks',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const { title, status, due_date } = req.body;
            const image_url = req.file ? req.file.location : req.body.image_url;
            const updateData = {};
            if (title)
                updateData.title = title;
            if (status)
                updateData.status = status;
            if (due_date)
                updateData.due_date = new Date(due_date);
            if (image_url)
                updateData.image_url = image_url;
            const task = await task_service_1.TaskService.update(id, userId.toString(), updateData);
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
        }
        catch (error) {
            return next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            await task_service_1.TaskService.delete(id, userId.toString());
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=task.controller.js.map