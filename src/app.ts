import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/error';
import { connectDB } from './config/database';
import { specs as swaggerSpec } from './docs/swagger';
import { apiLimiter, authLimiter } from './middleware/rate-limit';
import { requestLogger, errorLogger } from './middleware/logger';
import { cacheMiddleware } from './middleware/cache';

import collaboratorRoutes from './routes/collaborator.routes'
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import healthRoutes from './routes/health.routes';
import uploadRoutes from './routes/upload.routes';
import userProjectRoutes from './routes/userProject.routes';

// Initialize express app
const app = express();

// For render, idk why????
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));
app.use(helmet());
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Request logging
app.use(requestLogger);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/user', userProjectRoutes);
app.use('/api/collaborators', collaboratorRoutes)

// Cache middleware for GET requests
app.use('/api/projects', cacheMiddleware(300));
app.use('/api/tasks', cacheMiddleware(300));

// Error handling
app.use(errorLogger);
app.use(errorHandler);

export default app; 