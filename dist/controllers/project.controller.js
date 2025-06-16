"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const project_service_1 = require("../services/project.service");
const errors_1 = require("../utils/errors");
class ProjectController {
    static async getAll(_req, res, next) {
        try {
            const projects = await project_service_1.ProjectService.getAll();
            res.json({
                success: true,
                data: projects
            });
            return;
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async getById(req, res, next) {
        try {
            const project = await project_service_1.ProjectService.getById(req.params.id);
            if (!project) {
                throw new errors_1.ValidationError('Project not found');
            }
            if (!project.creator_id || typeof project.creator_id === 'string' || !('_id' in project.creator_id)) {
                throw new errors_1.ValidationError('Project data is not properly populated');
            }
            res.json({
                success: true,
                data: project
            });
            return;
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async create(req, res, next) {
        try {
            console.log('Creating project with data:', req.body);
            const project = await project_service_1.ProjectService.create({
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
        }
        catch (error) {
            console.error('Error creating project:', error);
            next(error);
            return;
        }
    }
    static async update(req, res, next) {
        try {
            console.log('Update Project - User ID:', req.user._id);
            console.log('Update Project - Project ID:', req.params.id);
            const project = await project_service_1.ProjectService.getById(req.params.id);
            if (!project) {
                throw new errors_1.ValidationError('Project not found');
            }
            if (!project.creator_id || typeof project.creator_id === 'string' || !('_id' in project.creator_id)) {
                throw new errors_1.ValidationError('Project data is not properly populated');
            }
            const creatorId = project.creator_id._id;
            const userId = req.user._id;
            console.log('Project found:', {
                creator_id: creatorId.toString(),
                user_id: userId.toString(),
                isCreator: creatorId.toString() === userId.toString(),
                collaborators: project.collaborators
            });
            if (creatorId.toString() !== userId.toString() &&
                !project.collaborators.some(collab => typeof collab === 'object' && '_id' in collab &&
                    collab._id.toString() === userId.toString())) {
                throw new errors_1.ValidationError('Not authorized to update this project');
            }
            const updatedProject = await project_service_1.ProjectService.update(req.params.id, req.body);
            res.json({
                success: true,
                data: updatedProject
            });
            return;
        }
        catch (error) {
            console.error('Error in update project:', error);
            next(error);
            return;
        }
    }
    static async delete(req, res, next) {
        try {
            console.log('Delete Project - User ID:', req.user._id);
            console.log('Delete Project - Project ID:', req.params.id);
            const project = await project_service_1.ProjectService.getById(req.params.id);
            if (!project) {
                throw new errors_1.ValidationError('Project not found');
            }
            if (!project.creator_id || typeof project.creator_id === 'string' || !('_id' in project.creator_id)) {
                throw new errors_1.ValidationError('Project data is not properly populated');
            }
            const creatorId = project.creator_id._id;
            const userId = req.user._id;
            console.log('Project found:', {
                creator_id: creatorId.toString(),
                user_id: userId.toString(),
                isCreator: creatorId.toString() === userId.toString()
            });
            if (creatorId.toString() !== userId.toString()) {
                throw new errors_1.ValidationError('Not authorized to delete this project');
            }
            await project_service_1.ProjectService.delete(req.params.id);
            res.status(204).send();
            return;
        }
        catch (error) {
            console.error('Error in delete project:', error);
            next(error);
            return;
        }
    }
    static async addCollaborator(req, res, next) {
        try {
            const project = await project_service_1.ProjectService.getById(req.params.id);
            if (!project) {
                throw new errors_1.ValidationError('Project not found');
            }
            if (!project.creator_id || typeof project.creator_id === 'string' || !('_id' in project.creator_id)) {
                throw new errors_1.ValidationError('Project data is not properly populated');
            }
            const creatorId = project.creator_id._id;
            const userId = req.user._id;
            if (creatorId.toString() !== userId.toString()) {
                throw new errors_1.ValidationError('Not authorized to add collaborators to this project');
            }
            const updatedProject = await project_service_1.ProjectService.addCollaborator(req.params.id, req.body.collaborator_id);
            res.json({
                success: true,
                data: updatedProject
            });
            return;
        }
        catch (error) {
            console.error('Error adding collaborator:', error);
            next(error);
            return;
        }
    }
    static async removeCollaborator(req, res, next) {
        try {
            const project = await project_service_1.ProjectService.getById(req.params.id);
            if (!project) {
                throw new errors_1.ValidationError('Project not found');
            }
            if (!project.creator_id || typeof project.creator_id === 'string' || !('_id' in project.creator_id)) {
                throw new errors_1.ValidationError('Project data is not properly populated');
            }
            const creatorId = project.creator_id._id;
            const userId = req.user._id;
            if (creatorId.toString() !== userId.toString()) {
                throw new errors_1.ValidationError('Not authorized to remove collaborators from this project');
            }
            const updatedProject = await project_service_1.ProjectService.removeCollaborator(req.params.id, req.params.collaboratorId);
            res.json({
                success: true,
                data: updatedProject
            });
            return;
        }
        catch (error) {
            console.error('Error removing collaborator:', error);
            next(error);
            return;
        }
    }
    static async getCollaborators(_req, res, next) {
        try {
            const collaborators = await project_service_1.ProjectService.getCollaborators(_req.params.id);
            res.json({
                success: true,
                data: collaborators
            });
            return;
        }
        catch (error) {
            console.error('Error getting collaborators:', error);
            next(error);
            return;
        }
    }
}
exports.ProjectController = ProjectController;
//# sourceMappingURL=project.controller.js.map