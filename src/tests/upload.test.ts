import request from 'supertest';
import app from '../app';
import User from '../models/User';
import mongoose from 'mongoose';
import path from 'path';

describe('File Upload', () => {
  let authToken: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tasksphere-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    // Create test user
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginRes.body.data.token;
  });

  describe('POST /api/upload/image', () => {
    it('should upload an image', async () => {
      const res = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', path.join(__dirname, '../fixtures/test-image.jpg'));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('url');
      expect(res.body.data).toHaveProperty('public_id');
    });

    it('should not upload without authentication', async () => {
      const res = await request(app)
        .post('/api/upload/image')
        .attach('image', path.join(__dirname, '../fixtures/test-image.jpg'));

      expect(res.status).toBe(401);
    });

    it('should validate file type', async () => {
      const res = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', path.join(__dirname, '../fixtures/test.txt'));

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/upload/image/:public_id', () => {
    let publicId: string;

    beforeEach(async () => {
      const uploadRes = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', path.join(__dirname, '../fixtures/test-image.jpg'));

      publicId = uploadRes.body.data.public_id;
    });

    it('should delete an image', async () => {
      const res = await request(app)
        .delete(`/api/upload/image/${publicId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not delete without authentication', async () => {
      const res = await request(app)
        .delete(`/api/upload/image/${publicId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/upload/image/:public_id', () => {
    let publicId: string;

    beforeEach(async () => {
      const uploadRes = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', path.join(__dirname, '../fixtures/test-image.jpg'));

      publicId = uploadRes.body.data.public_id;
    });

    it('should get image URL', async () => {
      const res = await request(app)
        .get(`/api/upload/image/${publicId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('url');
    });

    it('should not get URL without authentication', async () => {
      const res = await request(app)
        .get(`/api/upload/image/${publicId}`);

      expect(res.status).toBe(401);
    });
  });
}); 