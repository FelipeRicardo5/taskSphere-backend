import request from 'supertest';
import app from '../app';
import User from '../models/User';
import Project from '../models/Project';
import mongoose, { Types } from 'mongoose';

describe('Collaborators', () => {
  let creatorToken: string;
  let collaboratorToken: string;
  let creatorId: string;
  let projectId: string;
  let collaboratorId: string;

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

    // Add a collaborator to the project
    const collaborator = await User.create({
      name: 'Test Collaborator',
      email: 'collaborator@test.com',
      password: 'password123'
    });
    collaboratorId = (collaborator._id as Types.ObjectId).toString();

    await Project.findByIdAndUpdate(projectId, {
      $push: { collaborators: collaboratorId }
    });
  });

  describe('GET /api/collaborators/suggestions', () => {
    it('should get suggested collaborators', async () => {
      const res = await request(app)
        .get('/api/collaborators/suggestions')
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('email');
    });

    it('should not get suggestions without authentication', async () => {
      const res = await request(app)
        .get('/api/collaborators/suggestions');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/projects/:id/collaborators', () => {
    it('should add collaborator as creator', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/collaborators`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          collaborator_id: new mongoose.Types.ObjectId().toString()
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project.collaborators).toHaveLength(2);
    });

    it('should not add collaborator as non-creator', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/collaborators`)
        .set('Authorization', `Bearer ${collaboratorToken}`)
        .send({
          collaborator_id: new mongoose.Types.ObjectId().toString()
        });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/projects/:id/collaborators/:collaboratorId', () => {
    it('should remove collaborator as creator', async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectId}/collaborators/${collaboratorId}`)
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const project = await Project.findById(projectId);
      expect(project?.collaborators).not.toContain(collaboratorId);
    });

    it('should not remove collaborator as non-creator', async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectId}/collaborators/${collaboratorId}`)
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(res.status).toBe(403);
    });
  });
}); 