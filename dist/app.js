"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const error_1 = require("./middleware/error");
const database_1 = require("./config/database");
const swagger_1 = require("./docs/swagger");
const rate_limit_1 = require("./middleware/rate-limit");
const logger_1 = require("./middleware/logger");
const cache_1 = require("./middleware/cache");
const collaborator_routes_1 = __importDefault(require("./routes/collaborator.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const userProject_routes_1 = __importDefault(require("./routes/userProject.routes"));
const app = (0, express_1.default)();
(0, database_1.connectDB)();
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || []
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/', rate_limit_1.apiLimiter);
app.use('/api/auth/', rate_limit_1.authLimiter);
app.use(logger_1.requestLogger);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use('/api/health', health_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.use('/api/user', userProject_routes_1.default);
app.use('/api/collaborators', collaborator_routes_1.default);
app.use('/api/projects', (0, cache_1.cacheMiddleware)(300));
app.use('/api/tasks', (0, cache_1.cacheMiddleware)(300));
app.use(logger_1.errorLogger);
app.use(error_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map