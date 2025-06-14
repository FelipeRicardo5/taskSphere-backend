import request from 'supertest';
import app from '../app';
import User from '../models/User';
import Project from '../models/Project';
import mongoose from 'mongoose';
import { IUser } from '../types/models';
import { Types } from 'mongoose';

describe('Projects', () => {
  let creatorToken: string;
  let collaboratorToken: string;
  let creatorId: string;
  let projectId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tasksphere-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});

    // Create creator user
    const creator = await User.create({
      name: 'Project Creator',
      email: 'creator@example.com',
      password: 'password123'
    });
    creatorId = (creator._id as Types.ObjectId).toString();

    // Create collaborator user
    await User.create({
      name: 'Project Collaborator',
      email: 'collaborator@example.com',
      password: 'password123'
    });

    // Login as creator
    const creatorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'creator@example.com',
        password: 'password123'
      });
    creatorToken = creatorLogin.body.data.token;

    // Login as collaborator
    const collaboratorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'collaborator@example.com',
        password: 'password123'
      });
    collaboratorToken = collaboratorLogin.body.data.token;
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          name: 'Test Project',
          description: 'Test Description',
          start_date: new Date(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project).toHaveProperty('name', 'Test Project');
      projectId = res.body.data.project._id;
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          name: 'Test Project'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toHaveProperty('start_date');
      expect(res.body.errors).toHaveProperty('end_date');
    });

    it('should validate end_date is after start_date', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          name: 'Test Project',
          description: 'Test Description',
          start_date: new Date(),
          end_date: new Date(Date.now() - 24 * 60 * 60 * 1000)
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      // Create a project
      const project = await Project.create({
        name: 'Test Project',
        description: 'Test Description',
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        creator_id: creatorId,
        collaborators: []
      });
      projectId = (project._id as Types.ObjectId).toString();
    });

    it('should get all projects for user', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.projects)).toBe(true);
      expect(res.body.data.projects.length).toBeGreaterThan(0);
    });

    it('should not get projects without authentication', async () => {
      const res = await request(app)
        .get('/api/projects');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await Project.create({
        name: 'Test Project',
        description: 'Test Description',
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        creator_id: creatorId,
      }) as { _id: Types.ObjectId };

      projectId = (project._id as Types.ObjectId).toString();
    });

    it('should get project by id', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(projectId);
    });

    it('should not get non-existent project', async () => {
      const res = await request(app)
        .get(`/api/projects/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    beforeEach(async () => {
      // Create a project
      const project = await Project.create({
        name: 'Test Project',
        description: 'Test Description',
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        creator_id: creatorId,
        collaborators: []
      });
      projectId = (project._id as Types.ObjectId).toString();
    });

    it('should update project as creator', async () => {
      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          name: 'Updated Project',
          description: 'Updated Description'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project).toHaveProperty('name', 'Updated Project');
    });

    it('should not update project as collaborator', async () => {
      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${collaboratorToken}`)
        .send({
          name: 'Updated Project',
          description: 'Updated Description'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    beforeEach(async () => {
      // Create a project
      const project = await Project.create({
        name: 'Test Project',
        description: 'Test Description',
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        creator_id: creatorId,
        collaborators: []
      });
      projectId = (project._id as Types.ObjectId).toString();
    });

    it('should delete project as creator', async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify project is deleted
      const project = await Project.findById(projectId);
      expect(project).toBeNull();
    });

    it('should not delete project as collaborator', async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/projects/:id/collaborators', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await Project.create({
        name: 'Test Project',
        description: 'Test Description',
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        creator_id: creatorId,
      }) as { _id: Types.ObjectId };

      projectId = (project._id as Types.ObjectId).toString();
    });

    it('should add collaborator to project', async () => {
      const collaborator = await User.create({
        name: 'Collaborator',
        email: 'collaborator@example.com',
        password: 'password123',
      }) as IUser & { _id: Types.ObjectId };

      const res = await request(app)
        .post(`/api/projects/${projectId}/collaborators`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          collaborator_id: collaborator._id.toString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.collaborators).toContain(collaborator._id.toString());
    });

    it('should not add non-existent user as collaborator', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/collaborators`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          collaborator_id: new mongoose.Types.ObjectId().toString(),
        });

      expect(res.status).toBe(404);
    });
  });
}); 