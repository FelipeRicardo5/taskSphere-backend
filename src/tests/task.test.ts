import request from 'supertest';
import app from '../app';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Task';
import mongoose, { Types } from 'mongoose';

describe('Tasks', () => {
  let creatorToken: string;
  let collaboratorToken: string;
  let creatorId: string;
  let projectId: string;
  let taskId: string;

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
    await Task.deleteMany({});

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
  });

  describe('POST /api/tasks', () => {
    it('should create a new task as collaborator', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${collaboratorToken}`)
        .send({
          title: 'Test Task',
          status: 'todo',
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          image_url: 'https://example.com/image.jpg',
          project_id: projectId
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task).toHaveProperty('title', 'Test Task');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${collaboratorToken}`)
        .send({
          title: 'Test Task'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toHaveProperty('status');
      expect(res.body.errors).toHaveProperty('due_date');
      expect(res.body.errors).toHaveProperty('image_url');
      expect(res.body.errors).toHaveProperty('project_id');
    });

    it('should validate due_date is in the future', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${collaboratorToken}`)
        .send({
          title: 'Test Task',
          status: 'todo',
          due_date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          image_url: 'https://example.com/image.jpg',
          project_id: projectId
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create some tasks
      await Task.create({
        title: 'Task 1',
        status: 'todo',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        image_url: 'https://example.com/image1.jpg',
        project_id: projectId,
        creator_id: creatorId
      });

      await Task.create({
        title: 'Task 2',
        status: 'in_progress',
        due_date: new Date(Date.now() + 48 * 60 * 60 * 1000),
        image_url: 'https://example.com/image2.jpg',
        project_id: projectId,
        creator_id: creatorId
      });
    });

    it('should get tasks with filters and pagination', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .query({
          status: 'todo',
          project_id: projectId,
          page: 1,
          limit: 10
        })
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.tasks)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should search tasks by title', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .query({
          title: 'Task 1'
        })
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tasks.length).toBe(1);
      expect(res.body.data.tasks[0].title).toBe('Task 1');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get task by id', async () => {
      const task = await Task.create({
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        due_date: new Date(Date.now() + 86400000),
        project_id: projectId,
        creator_id: creatorId
      });
      taskId = (task._id as Types.ObjectId).toString();
      // ... existing code ...
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task', async () => {
      const task = await Task.create({
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        due_date: new Date(Date.now() + 86400000),
        project_id: projectId,
        creator_id: creatorId
      });
      taskId = (task._id as Types.ObjectId).toString();
      // ... existing code ...
    });

    it('should update task as creator', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'Updated Task',
          status: 'in_progress'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task).toHaveProperty('title', 'Updated Task');
      expect(res.body.data.task).toHaveProperty('status', 'in_progress');
    });

    it('should not update task as non-creator', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${collaboratorToken}`)
        .send({
          title: 'Updated Task',
          status: 'in_progress'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task as creator', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify task is deleted
      const task = await Task.findById(taskId);
      expect(task).toBeNull();
    });

    it('should not delete task as non-creator', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${collaboratorToken}`);

      expect(res.status).toBe(403);
    });
  });
});