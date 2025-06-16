"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const Project_1 = __importDefault(require("../models/Project"));
const User_1 = __importDefault(require("../models/User"));
class ProjectService {
    static async getAll() {
        try {
            const projects = await Project_1.default.find()
                .populate('creator_id', 'name email')
                .lean();
            return projects;
        }
        catch (error) {
            console.error('Error getting project by ID:', error);
            throw error;
        }
    }
    static async getById(id) {
        try {
            console.log('Getting project by ID:', id);
            const project = await Project_1.default.findById(id)
                .populate('creator_id', 'name email')
                .populate('collaborators', 'name email')
                .lean();
            console.log('Project found:', project);
            return project;
        }
        catch (error) {
            console.error('Error getting project by ID:', error);
            throw error;
        }
    }
    static async create(projectData) {
        const project = await Project_1.default.create(projectData);
        return project.toObject();
    }
    static async update(id, updateData) {
        try {
            if (updateData.start_date && updateData.end_date) {
                const startDate = new Date(updateData.start_date);
                const endDate = new Date(updateData.end_date);
                if (endDate <= startDate) {
                    throw new Error('End date must be after start date');
                }
            }
            else if (updateData.start_date) {
                const project = await Project_1.default.findById(id);
                if (project && new Date(updateData.start_date) >= project.end_date) {
                    throw new Error('Start date must be before end date');
                }
            }
            else if (updateData.end_date) {
                const project = await Project_1.default.findById(id);
                if (project && new Date(updateData.end_date) <= project.start_date) {
                    throw new Error('End date must be after start date');
                }
            }
            if (updateData.start_date || updateData.end_date) {
                const project = await Project_1.default.findById(id);
                if (!project) {
                    throw new Error('Project not found');
                }
                if (updateData.start_date)
                    project.start_date = new Date(updateData.start_date);
                if (updateData.end_date)
                    project.end_date = new Date(updateData.end_date);
                await project.validate();
                const updatedProject = await Project_1.default.findByIdAndUpdate(id, { $set: updateData }, {
                    new: true,
                    runValidators: true,
                    context: 'query'
                }).populate('creator_id', 'name email')
                    .populate('collaborators', 'name email')
                    .lean();
                return updatedProject;
            }
            const updatedProject = await Project_1.default.findByIdAndUpdate(id, { $set: updateData }, {
                new: true,
                runValidators: true,
                context: 'query'
            }).populate('creator_id', 'name email')
                .populate('collaborators', 'name email')
                .lean();
            if (!updatedProject) {
                throw new Error('Project not found');
            }
            return updatedProject;
        }
        catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    }
    static async delete(id) {
        await Project_1.default.findByIdAndDelete(id);
    }
    static async addCollaborator(projectId, collaboratorId) {
        return Project_1.default.findByIdAndUpdate(projectId, { $addToSet: { collaborators: collaboratorId } }, { new: true }).lean();
    }
    static async removeCollaborator(projectId, collaboratorId) {
        return Project_1.default.findByIdAndUpdate(projectId, { $pull: { collaborators: collaboratorId } }, { new: true }).lean();
    }
    static async getCollaborators(projectId) {
        const project = await Project_1.default.findById(projectId).select('collaborators').lean();
        if (!project)
            return [];
        return project.collaborators.map(id => id.toString());
    }
    static async getByUser(userId) {
        return Project_1.default.find({
            $or: [{ creator_id: userId }, { collaborators: userId }],
        })
            .populate('creator_id', 'name email')
            .populate('collaborators', 'name email')
            .sort({ createdAt: -1 })
            .lean();
    }
    static async addCollaboratorToUser(projectId, userId, collaboratorEmail) {
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        const creatorId = project.creator_id;
        if (creatorId.toString() !== userId) {
            throw new Error('Not authorized to add collaborators');
        }
        const collaborator = await User_1.default.findOne({ email: collaboratorEmail }).exec();
        if (!collaborator) {
            throw new Error('User not found');
        }
        const collaboratorId = collaborator._id;
        if (project.collaborators.some(id => id.toString() === collaboratorId.toString())) {
            throw new Error('User is already a collaborator');
        }
        project.collaborators.push(collaboratorId);
        await project.save();
        return Project_1.default.findById(projectId)
            .populate('creator_id', 'name email')
            .populate('collaborators', 'name email')
            .lean();
    }
    static async removeCollaboratorFromUser(projectId, userId, collaboratorId) {
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        const creatorId = project.creator_id;
        if (creatorId.toString() !== userId) {
            throw new Error('Not authorized to remove collaborators');
        }
        project.collaborators = project.collaborators.filter(id => id.toString() !== collaboratorId);
        await project.save();
        return Project_1.default.findById(projectId)
            .populate('creator_id', 'name email')
            .populate('collaborators', 'name email')
            .lean();
    }
    static async getSuggestedCollaborators() {
        try {
            const response = await fetch('https://randomuser.me/api/?results=5');
            const data = await response.json();
            return data.results.map((user) => ({
                name: `${user.name.first} ${user.name.last}`,
                email: user.email,
                picture: user.picture.thumbnail,
            }));
        }
        catch (error) {
            console.error('Error fetching suggested collaborators:', error);
            return [];
        }
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=project.service.js.map