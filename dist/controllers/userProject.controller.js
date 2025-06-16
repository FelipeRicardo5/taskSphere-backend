"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProjectController = void 0;
const project_service_1 = require("../services/project.service");
const errors_1 = require("../utils/errors");
class UserProjectController {
    static async getUserProjects(req, res, next) {
        try {
            const userId = req.user._id;
            if (!userId) {
                throw new errors_1.ValidationError('User not authenticated');
            }
            const projects = await project_service_1.ProjectService.getByUser(userId.toString());
            res.json({
                success: true,
                data: {
                    projects,
                    total: projects.length
                }
            });
            return;
        }
        catch (error) {
            console.error('Error getting user projects:', error);
            next(error);
            return;
        }
    }
    static async getCreatedProjects(req, res, next) {
        try {
            const userId = req.user._id;
            if (!userId) {
                throw new errors_1.ValidationError('User not authenticated');
            }
            const projects = await project_service_1.ProjectService.getByUser(userId.toString());
            const createdProjects = projects.filter(project => project.creator_id._id.toString() === userId.toString());
            res.json({
                success: true,
                data: {
                    projects: createdProjects,
                    total: createdProjects.length
                }
            });
            return;
        }
        catch (error) {
            console.error('Error getting created projects:', error);
            next(error);
            return;
        }
    }
    static async getCollaboratedProjects(req, res, next) {
        try {
            const userId = req.user._id;
            if (!userId) {
                throw new errors_1.ValidationError('User not authenticated');
            }
            const projects = await project_service_1.ProjectService.getByUser(userId.toString());
            const collaboratedProjects = projects.filter(project => project.collaborators.some(collab => collab._id.toString() === userId.toString()));
            res.json({
                success: true,
                data: {
                    projects: collaboratedProjects,
                    total: collaboratedProjects.length
                }
            });
            return;
        }
        catch (error) {
            console.error('Error getting collaborated projects:', error);
            next(error);
            return;
        }
    }
}
exports.UserProjectController = UserProjectController;
//# sourceMappingURL=userProject.controller.js.map