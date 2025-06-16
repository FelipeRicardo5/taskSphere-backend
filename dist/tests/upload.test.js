"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
describe('File Upload', () => {
    let authToken;
    beforeAll(async () => {
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tasksphere-test');
    });
    afterAll(async () => {
        await mongoose_1.default.connection.dropDatabase();
        await mongoose_1.default.connection.close();
    });
    beforeEach(async () => {
        await User_1.default.deleteMany({});
        await User_1.default.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            email: 'test@example.com',
            password: 'password123'
        });
        authToken = loginRes.body.data.token;
    });
    describe('POST /api/upload/image', () => {
        it('should upload an image', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/upload/image')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', path_1.default.join(__dirname, '../fixtures/test-image.jpg'));
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('url');
            expect(res.body.data).toHaveProperty('public_id');
        });
        it('should not upload without authentication', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/upload/image')
                .attach('image', path_1.default.join(__dirname, '../fixtures/test-image.jpg'));
            expect(res.status).toBe(401);
        });
        it('should validate file type', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/upload/image')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', path_1.default.join(__dirname, '../fixtures/test.txt'));
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
    describe('DELETE /api/upload/image/:public_id', () => {
        let publicId;
        beforeEach(async () => {
            const uploadRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/upload/image')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', path_1.default.join(__dirname, '../fixtures/test-image.jpg'));
            publicId = uploadRes.body.data.public_id;
        });
        it('should delete an image', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/upload/image/${publicId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
        it('should not delete without authentication', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/upload/image/${publicId}`);
            expect(res.status).toBe(401);
        });
    });
    describe('GET /api/upload/image/:public_id', () => {
        let publicId;
        beforeEach(async () => {
            const uploadRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/upload/image')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('image', path_1.default.join(__dirname, '../fixtures/test-image.jpg'));
            publicId = uploadRes.body.data.public_id;
        });
        it('should get image URL', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get(`/api/upload/image/${publicId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('url');
        });
        it('should not get URL without authentication', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get(`/api/upload/image/${publicId}`);
            expect(res.status).toBe(401);
        });
    });
});
//# sourceMappingURL=upload.test.js.map