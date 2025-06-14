import { IProject } from '../models/Project';
import Project from '../models/Project';
import User from '../models/User';
import { Types } from 'mongoose';

export class ProjectService {
  // Get all projects
  static async getAll(): Promise<IProject[]> {
    return Project.find().lean();
  }

  // Get project by ID
  static async getById(id: string): Promise<IProject | null> {
    return Project.findById(id).lean();
  }

  // Create new project
  static async create(projectData: {
    name: string;
    description?: string;
    start_date: Date;
    end_date: Date;
    creator_id: string;
  }): Promise<IProject> {
    const project = await Project.create(projectData);
    return project.toObject();
  }

  // Update project
  static async update(
    id: string,
    updateData: Partial<IProject>
  ): Promise<IProject | null> {
    return Project.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  // Delete project
  static async delete(id: string): Promise<void> {
    await Project.findByIdAndDelete(id);
  }

  // Add collaborator to project
  static async addCollaborator(
    projectId: string,
    collaboratorId: string
  ): Promise<IProject | null> {
    return Project.findByIdAndUpdate(
      projectId,
      { $addToSet: { collaborators: collaboratorId } },
      { new: true }
    ).lean();
  }

  // Remove collaborator from project
  static async removeCollaborator(
    projectId: string,
    collaboratorId: string
  ): Promise<IProject | null> {
    return Project.findByIdAndUpdate(
      projectId,
      { $pull: { collaborators: collaboratorId } },
      { new: true }
    ).lean();
  }

  // Get project collaborators
  static async getCollaborators(projectId: string): Promise<string[]> {
    const project = await Project.findById(projectId).select('collaborators').lean();
    if (!project) return [];
    
    return project.collaborators.map(id => id.toString());
  }

  // Get all projects for a user (created or collaborated)
  static async getByUser(userId: string): Promise<IProject[]> {
    return Project.find({
      $or: [{ creator_id: userId }, { collaborators: userId }],
    })
      .populate('creator_id', 'name email')
      .populate('collaborators', 'name email')
      .sort({ createdAt: -1 })
      .lean();
  }

  // Add collaborator
  static async addCollaboratorToUser(
    projectId: string,
    userId: string,
    collaboratorEmail: string
  ): Promise<IProject> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const creatorId = project.creator_id;
    if (creatorId.toString() !== userId) {
      throw new Error('Not authorized to add collaborators');
    }

    const collaborator = await User.findOne({ email: collaboratorEmail }).exec();

    if (!collaborator) {
      throw new Error('User not found');
    }

    const collaboratorId = collaborator._id as Types.ObjectId;
    if (project.collaborators.some(id => id.toString() === collaboratorId.toString())) {
      throw new Error('User is already a collaborator');
    }

    project.collaborators.push(collaboratorId);
    await project.save();

    return Project.findById(projectId)
      .populate('creator_id', 'name email')
      .populate('collaborators', 'name email')
      .lean() as Promise<IProject>;
  }

  // Remove collaborator
  static async removeCollaboratorFromUser(
    projectId: string,
    userId: string,
    collaboratorId: string
  ): Promise<IProject> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const creatorId = project.creator_id;
    if (creatorId.toString() !== userId) {
      throw new Error('Not authorized to remove collaborators');
    }

    project.collaborators = project.collaborators.filter(
      id => id.toString() !== collaboratorId
    );
    await project.save();

    return Project.findById(projectId)
      .populate('creator_id', 'name email')
      .populate('collaborators', 'name email')
      .lean() as Promise<IProject>;
  }

  // Get suggested collaborators from randomuser.me API
  static async getSuggestedCollaborators(): Promise<Array<{
    name: string;
    email: string;
    picture: string;
  }>> {
    try {
      const response = await fetch('https://randomuser.me/api/?results=5');
      const data = await response.json() as { results: Array<{
        name: { first: string; last: string };
        email: string;
        picture: { thumbnail: string };
      }> };
      
      return data.results.map((user) => ({
        name: `${user.name.first} ${user.name.last}`,
        email: user.email,
        picture: user.picture.thumbnail,
      }));
    } catch (error) {
      console.error('Error fetching suggested collaborators:', error);
      return [];
    }
  }
} 