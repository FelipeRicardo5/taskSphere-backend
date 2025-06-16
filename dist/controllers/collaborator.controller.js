"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaboratorController = void 0;
const collaborator_service_1 = require("../services/collaborator.service");
const project_service_1 = require("../services/project.service");
const errors_1 = require("../utils/errors");
class CollaboratorController {
    static async getSuggestedCollaborators(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const suggestions = await collaborator_service_1.CollaboratorService.getSuggestedCollaborators(limit);
            res.json({
                success: true,
                data: suggestions
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching suggested collaborators',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async addCollaborator(req, res) {
        var _a;
        try {
            const { id } = req.params;
            const { email } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                throw new errors_1.UnauthorizedError('User not authenticated');
            }
            if (!req.body || Object.keys(req.body).length === 0) {
                throw new errors_1.BadRequestError('Request body is required');
            }
            if (!email) {
                throw new errors_1.BadRequestError('Email is required');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new errors_1.BadRequestError('Invalid email format');
            }
            const allowedFields = ['email'];
            const extraFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
            if (extraFields.length > 0) {
                throw new errors_1.BadRequestError(`Extra fields not allowed: ${extraFields.join(', ')}`);
            }
            const project = await project_service_1.ProjectService.addCollaboratorToUser(id, userId.toString(), email);
            return res.status(200).json(project);
        }
        catch (error) {
            if (error instanceof errors_1.BadRequestError) {
                return res.status(400).json({ error: error.message });
            }
            if (error instanceof errors_1.NotFoundError) {
                return res.status(404).json({ error: error.message });
            }
            if (error instanceof errors_1.UnauthorizedError) {
                return res.status(401).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Failed to add collaborator' });
        }
    }
    static async removeCollaborator(req, res) {
        var _a;
        try {
            const { id, collaboratorId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                throw new errors_1.UnauthorizedError('User not authenticated');
            }
            const project = await project_service_1.ProjectService.removeCollaboratorFromUser(id, userId.toString(), collaboratorId);
            return res.status(200).json(project);
        }
        catch (error) {
            if (error instanceof errors_1.BadRequestError) {
                return res.status(400).json({ error: error.message });
            }
            if (error instanceof errors_1.NotFoundError) {
                return res.status(404).json({ error: error.message });
            }
            if (error instanceof errors_1.UnauthorizedError) {
                return res.status(401).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Failed to remove collaborator' });
        }
    }
}
exports.CollaboratorController = CollaboratorController;
//# sourceMappingURL=collaborator.controller.js.map