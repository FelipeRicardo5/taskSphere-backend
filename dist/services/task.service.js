"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const Project_1 = __importDefault(require("../models/Project"));
const errors_1 = require("../utils/errors");
class TaskService {
    static async create(taskData) {
        const project = await Project_1.default.findById(taskData.project_id);
        if (!project) {
            throw new Error('Project not found');
        }
        const creatorId = project.creator_id;
        if (creatorId.toString() !== taskData.creator_id &&
            !project.collaborators.some(id => id.toString() === taskData.creator_id)) {
            throw new Error('Not authorized to create tasks in this project');
        }
        const task = await Task_1.default.create(taskData);
        return task;
    }
    static async getById(taskId) {
        return Task_1.default.findById(taskId)
            .populate('project_id', 'name')
            .populate('creator_id', 'name email');
    }
    static async getTasks(filters) {
        const { title, status, project_id, creator_id, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;
        const query = {};
        if (title) {
            query.title = { $regex: title, $options: 'i' };
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
        const [tasks, total] = await Promise.all([
            Task_1.default.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .populate('creator_id', 'name email')
                .populate('project_id', 'name'),
            Task_1.default.countDocuments(query),
        ]);
        const filteredTasks = tasks.filter(task => task.creator_id._id.toString() === (creator_id === null || creator_id === void 0 ? void 0 : creator_id.toString()));
        return {
            tasks: filteredTasks,
            total: filteredTasks.length,
            page,
            totalPages: Math.ceil(filteredTasks.length / limit),
        };
    }
    static async update(taskId, userId, updateData) {
        const task = await Task_1.default.findById(taskId);
        if (!task) {
            throw new Error('Task not found');
        }
        const project = await Project_1.default.findById(task.project_id);
        if (!project) {
            throw new Error('Project not found');
        }
        const creatorId = project.creator_id;
        const taskCreatorId = task.creator_id;
        if (taskCreatorId.toString() !== userId &&
            creatorId.toString() !== userId) {
            throw new Error('Not authorized to update this task');
        }
        return Task_1.default.findByIdAndUpdate(taskId, updateData, {
            new: true,
            runValidators: true,
        })
            .populate('project_id', 'name')
            .populate('creator_id', 'name email');
    }
    static async delete(taskId, userId) {
        const task = await Task_1.default.findById(taskId);
        if (!task) {
            throw new Error('Task not found');
        }
        const project = await Project_1.default.findById(task.project_id);
        if (!project) {
            throw new Error('Project not found');
        }
        const creatorId = project.creator_id;
        const taskCreatorId = task.creator_id;
        if (taskCreatorId.toString() !== userId &&
            creatorId.toString() !== userId) {
            throw new Error('Not authorized to delete this task');
        }
        await task.deleteOne();
    }
    async validateTaskDates(dueDate) {
        if (dueDate < new Date()) {
            throw new errors_1.BadRequestError('Due date must be in the future');
        }
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=task.service.js.map