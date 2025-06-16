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
describe('Collaborators', () => {
    let creatorToken;
    let collaboratorToken;
    let creatorId;
    let projectId;
    let collaboratorId;
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
        const project = await Project_1.default.create({
            name: 'Test Project',
            description: 'Test Description',
            start_date: new Date(),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            creator_id: creatorId,
            collaborators: []
        });
        projectId = project._id.toString();
        const collaborator = await User_1.default.create({
            name: 'Test Collaborator',
            email: 'collaborator@test.com',
            password: 'password123'
        });
        collaboratorId = collaborator._id.toString();
        await Project_1.default.findByIdAndUpdate(projectId, {
            $push: { collaborators: collaboratorId }
        });
    });
    describe('GET /api/collaborators/suggestions', () => {
        it('should get suggested collaborators', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/collaborators/suggestions');
            expect(res.status).toBe(401);
        });
    });
    describe('POST /api/projects/:id/collaborators', () => {
        it('should add collaborator as creator', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/projects/${projectId}/collaborators`)
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({
                email: 'new-collaborator@test.com'
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.project.collaborators).toHaveLength(2);
        });
        it('should not add collaborator as non-creator', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/projects/${projectId}/collaborators`)
                .set('Authorization', `Bearer ${collaboratorToken}`)
                .send({
                email: 'new-collaborator@test.com'
            });
            expect(res.status).toBe(403);
        });
        it('should return 400 when request body is empty', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/projects/${projectId}/collaborators`)
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Request body is required');
        });
        it('should return 400 when email is missing', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/projects/${projectId}/collaborators`)
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({
                name: 'Test User'
            });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Email is required');
        });
        it('should return 400 when email format is invalid', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/projects/${projectId}/collaborators`)
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({
                email: 'invalid-email'
            });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid email format');
        });
        it('should return 400 when extra fields are present', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/projects/${projectId}/collaborators`)
                .set('Authorization', `Bearer ${creatorToken}`)
                .send({
                email: 'test@example.com',
                extraField: 'value'
            });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Extra fields not allowed: extraField');
        });
    });
    describe('DELETE /api/projects/:id/collaborators/:collaboratorId', () => {
        it('should remove collaborator as creator', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/projects/${projectId}/collaborators/${collaboratorId}`)
                .set('Authorization', `Bearer ${creatorToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            const project = await Project_1.default.findById(projectId);
            expect(project === null || project === void 0 ? void 0 : project.collaborators).not.toContain(collaboratorId);
        });
        it('should not remove collaborator as non-creator', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/projects/${projectId}/collaborators/${collaboratorId}`)
                .set('Authorization', `Bearer ${collaboratorToken}`);
            expect(res.status).toBe(403);
        });
    });
});
//# sourceMappingURL=collaborator.test.js.map