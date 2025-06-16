"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const User_1 = __importDefault(require("../models/User"));
const Project_1 = __importDefault(require("../models/Project"));
const mongoose_1 = __importDefault(require("mongoose"));
describe('Projects', () => {
    let creatorToken;
    let collaboratorToken;
    let creatorId;
    let projectId;
    beforeAll(async () => {
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tasksphere-test');
    });
    afterAll(async () => {
        await mongoose_1.default.connection.dropDatabase();
        await mongoose_1.default.connection.close();
    });
    beforeEach(async () => {
        await User_1.default.deleteMany({});
        await Project_1.default.deleteMany({});
        const creator = await User_1.default.create({
            name: 'Project Creator',
            email: 'creator@example.com',
            password: 'password123'
        });
        creatorId = creator._id.toString();
        await User_1.default.create({
            name: 'Project Collaborator',
            email: 'collaborator@example.com',
            password: 'password123'
        });
        const creatorLogin = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'creator@example.com',
            password: 'password123'
        });
        creatorToken = creatorLogin.body.data.token;
        const collaboratorLogin = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'collaborator@example.com',
            password: 'password123'
        });
        collaboratorToken = collaboratorLogin.body.data.token;
    });
    describe('POST /api/projects', () => {
        it('should create a new project', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
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
            const project = await Project_1.default.create({
                name: 'Test Project',
                description: 'Test Description',
                start_date: new Date(),
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                creator_id: creatorId,
                collaborators: []
            });
            projectId = project._id.toString();
        });
        it('should get all projects for user', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects')
                .set('Authorization', `Bearer ${creatorToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.projects)).toBe(true);
            expect(res.body.data.projects.length).toBeGreaterThan(0);
        });
        it('should not get projects without authentication', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects');
            expect(res.status).toBe(401);
        });
    });
    describe('GET /api/projects/:id', () => {
        let projectId;
        beforeEach(async () => {
            const project = await Project_1.default.create({
                name: 'Test Project',
                description: 'Test Description',
                start_date: new Date(),
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                creator_id: creatorId,
            });
            projectId = project._id.toString();
        });
        it('should get project by id', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get(`/api/projects/${projectId}`)
                .set('Authorization', `Bearer ${creatorToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id.toString()).toBe(projectId);
        });
        it('should not get non-existent project', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get(`/api/projects/${new mongoose_1.default.Types.ObjectId()}`)
                .set('Authorization', `Bearer ${creatorToken}`);
            expect(res.status).toBe(404);
        });
    });
    describe('PUT /api/projects/:id', () => {
        beforeEach(async () => {
            const project = await Project_1.default.create({
                name: 'Test Project',
                description: 'Test Description',
                start_date: new Date(),
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                creator_id: creatorId,
                collaborators: []
            });
            projectId = project._id.toString();
        });
        it('should update project as creator', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
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
            const project = await Project_1.default.create({
                name: 'Test Project',
                description: 'Test Description',
                start_date: new Date(),
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                creator_id: creatorId,
                collaborators: []
            });
            projectId = project._id.toString();
        });
        it('should delete project as creator', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/projects/${projectId}`)
                .set('Authorization', `Bearer ${creatorToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            const project = await Project_1.default.findById(projectId);
            expect(project).toBeNull();
        });
        it('should not delete project as collaborator', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/projects/${projectId}`)
                .set('Authorization', `Bearer ${collaboratorToken}`);
            expect(res.status).toBe(403);
        });
    });
    describe('POST /api/projects/:id/collaborators', () => {
        let projectId;
        beforeEach(async () => {
            const project = await Project_1.default.create({
                name: 'Test Project',
                description: 'Test Description',
                start_date: new Date(),
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                creator_id: creatorId,
            });
            projectId = project._id.toString();
        });
        it('should add collaborator to project', async () => {
            const collaborator = await User_1.default.create({
                name: 'Collaborator',
                email: 'collaborator@example.com',
                password: 'password123',
            });
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/projects/${projectId}/collaborators`)
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({
                collaborator_id: new mongoose_1.default.Types.ObjectId().toString(),
            });
            expect(res.status).toBe(404);
        });
    });
});
//# sourceMappingURL=project.test.js.map