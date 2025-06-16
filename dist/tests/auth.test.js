"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const User_1 = __importDefault(require("../models/User"));
const RefreshToken_1 = __importDefault(require("../models/RefreshToken"));
const mongoose_1 = __importDefault(require("mongoose"));
describe('Authentication', () => {
    beforeAll(async () => {
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tasksphere-test');
    });
    afterAll(async () => {
        await mongoose_1.default.connection.dropDatabase();
        await mongoose_1.default.connection.close();
    });
    beforeEach(async () => {
        await User_1.default.deleteMany({});
        await RefreshToken_1.default.deleteMany({});
    });
    describe('POST /api/auth/register', () => {
        it('should register a new user with valid data', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
            expect(res.body.data).toHaveProperty('token');
        });
        it('should not register user with existing email', async () => {
            await User_1.default.create({
                name: 'Existing User',
                email: 'test@example.com',
                password: 'password123'
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
        it('should validate required fields', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                name: 'Test User'
            });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toHaveProperty('email');
            expect(res.body.errors).toHaveProperty('password');
        });
    });
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await User_1.default.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });
        });
        it('should login with valid credentials', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'password123'
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
        });
        it('should not login with invalid password', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'wrongpassword'
            });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
        it('should not login with non-existent email', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'nonexistent@example.com',
                password: 'password123'
            });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
    describe('POST /api/auth/refresh-token', () => {
        let refreshToken;
        beforeEach(async () => {
            const user = await User_1.default.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
            const token = await RefreshToken_1.default.create({
                user: user._id,
                token: 'valid-refresh-token',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            refreshToken = token.token;
        });
        it('should refresh token with valid refresh token', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/refresh-token')
                .send({
                refreshToken,
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data).toHaveProperty('refreshToken');
        });
        it('should not refresh token with invalid refresh token', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/refresh-token')
                .send({
                refreshToken: 'invalid-token',
            });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
    describe('POST /api/auth/logout', () => {
        let refreshToken;
        beforeEach(async () => {
            const user = await User_1.default.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
            const token = await RefreshToken_1.default.create({
                user: user._id,
                token: 'valid-refresh-token',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            refreshToken = token.token;
        });
        it('should logout with valid refresh token', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/logout')
                .send({
                refreshToken,
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            const tokenExists = await RefreshToken_1.default.findOne({ token: refreshToken });
            expect(tokenExists).toBeNull();
        });
        it('should not logout with invalid refresh token', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/logout')
                .send({
                refreshToken: 'invalid-token',
            });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
    describe('Protected Routes', () => {
        let token;
        beforeEach(async () => {
            const loginRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'password123'
            });
            token = loginRes.body.data.token;
        });
        it('should access protected route with valid token', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
        });
        it('should not access protected route without token', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects');
            expect(res.status).toBe(401);
        });
        it('should not access protected route with invalid token', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/projects')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.status).toBe(401);
        });
    });
});
//# sourceMappingURL=auth.test.js.map