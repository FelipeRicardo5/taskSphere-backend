import { IProject } from '../models/Project';
import Project from '../models/Project';
import User from '../models/User';
import { Types } from 'mongoose';

export class ProjectService {
  // Get all projects
  static async getAll(): Promise<IProject[]> {
    try{
      const projects = await Project.find()
      .populate('creator_id', 'name email')
      .lean()

      return projects
    }catch(error){
      console.error('Error getting project by ID:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<IProject | null> {
    try {
      console.log('Getting project by ID:', id);
      const project = await Project.findById(id)
        .populate('creator_id', 'name email')
        .populate('collaborators', 'name email')
        .lean();
      
      console.log('Project found:', project);
      return project;
    } catch (error) {
      console.error('Error getting project by ID:', error);
      throw error;
    }
  }

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
    try {
      // Se ambas as datas estiverem sendo atualizadas, validar a relação entre elas
      if (updateData.start_date && updateData.end_date) {
        const startDate = new Date(updateData.start_date);
        const endDate = new Date(updateData.end_date);
        
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      // Se apenas a data de início estiver sendo atualizada, verificar com a data de término existente
      else if (updateData.start_date) {
        const project = await Project.findById(id);
        if (project && new Date(updateData.start_date) >= project.end_date) {
          throw new Error('Start date must be before end date');
        }
      }
      // Se apenas a data de término estiver sendo atualizada, verificar com a data de início existente
      else if (updateData.end_date) {
        const project = await Project.findById(id);
        if (project && new Date(updateData.end_date) <= project.start_date) {
          throw new Error('End date must be after start date');
        }
      }

      // Primeiro atualiza as datas para garantir a validação correta
      if (updateData.start_date || updateData.end_date) {
        const project = await Project.findById(id);
        if (!project) {
          throw new Error('Project not found');
        }

        // Atualiza as datas no documento antes de salvar
        if (updateData.start_date) project.start_date = new Date(updateData.start_date);
        if (updateData.end_date) project.end_date = new Date(updateData.end_date);

        // Valida o documento
        await project.validate();

        // Atualiza o resto dos campos
        const updatedProject = await Project.findByIdAndUpdate(
          id,
          { $set: updateData },
          { 
            new: true,
            runValidators: true,
            context: 'query'
          }
        ).populate('creator_id', 'name email')
         .populate('collaborators', 'name email')
         .lean();

        return updatedProject;
      }

      // Se não estiver atualizando datas, atualiza normalmente
      const updatedProject = await Project.findByIdAndUpdate(
        id,
        { $set: updateData },
        { 
          new: true,
          runValidators: true,
          context: 'query'
        }
      ).populate('creator_id', 'name email')
       .populate('collaborators', 'name email')
       .lean();

      if (!updatedProject) {
        throw new Error('Project not found');
      }

      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
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