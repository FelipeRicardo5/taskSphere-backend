"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const User_1 = __importDefault(require("../models/User"));
const Project_1 = __importDefault(require("../models/Project"));
const Task_1 = __importDefault(require("../models/Task"));
const mongoose_1 = __importDefault(require("mongoose"));
describe('Tasks', () => {
    let creatorToken;
    let collaboratorToken;
    let creatorId;
    let projectId;
    let taskId;
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
        await Task_1.default.deleteMany({});
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
    describe('POST /api/tasks', () => {
        it('should create a new task as collaborator', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
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
            await Task_1.default.create({
                title: 'Task 1',
                status: 'todo',
                due_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
                image_url: 'https://example.com/image1.jpg',
                project_id: projectId,
                creator_id: creatorId
            });
            await Task_1.default.create({
                title: 'Task 2',
                status: 'in_progress',
                due_date: new Date(Date.now() + 48 * 60 * 60 * 1000),
                image_url: 'https://example.com/image2.jpg',
                project_id: projectId,
                creator_id: creatorId
            });
        });
        it('should get tasks with filters and pagination', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
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
            const task = await Task_1.default.create({
                title: 'Test Task',
                description: 'Test Description',
                status: 'pending',
                due_date: new Date(Date.now() + 86400000),
                project_id: projectId,
                creator_id: creatorId
            });
            taskId = task._id.toString();
        });
    });
    describe('PUT /api/tasks/:id', () => {
        it('should update task', async () => {
            const task = await Task_1.default.create({
                title: 'Test Task',
                description: 'Test Description',
                status: 'pending',
                due_date: new Date(Date.now() + 86400000),
                project_id: projectId,
                creator_id: creatorId
            });
            taskId = task._id.toString();
        });
        it('should update task as creator', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${creatorToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            const task = await Task_1.default.findById(taskId);
            expect(task).toBeNull();
        });
        it('should not delete task as non-creator', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${collaboratorToken}`);
            expect(res.status).toBe(403);
        });
    });
});
//# sourceMappingURL=task.test.js.map