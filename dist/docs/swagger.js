"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TaskSphere API',
            version: '1.0.0',
            description: 'API documentation for TaskSphere project management application',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', format: 'password' },
                        role: { type: 'string', enum: ['user', 'admin'] },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Project: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        start_date: { type: 'string', format: 'date-time' },
                        end_date: { type: 'string', format: 'date-time' },
                        creator_id: { type: 'string' },
                        collaborators: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Task: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        title: { type: 'string' },
                        status: { type: 'string', enum: ['todo', 'in_progress', 'completed'] },
                        due_date: { type: 'string', format: 'date-time' },
                        image_url: { type: 'string' },
                        project_id: { type: 'string' },
                        creator_id: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Notification: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        user_id: { type: 'string' },
                        type: { type: 'string', enum: ['task_assigned', 'project_updated', 'collaborator_added'] },
                        message: { type: 'string' },
                        read: { type: 'boolean' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        errors: { type: 'object' }
                    }
                }
            }
        },
        paths: {
            '/api/auth/register': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Register a new user',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['name', 'email', 'password'],
                                    properties: {
                                        name: { type: 'string' },
                                        email: { type: 'string', format: 'email' },
                                        password: { type: 'string', format: 'password' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: 'User registered successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    user: { $ref: '#/components/schemas/User' },
                                                    token: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Validation error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' }
                                }
                            }
                        }
                    }
                }
            },
            '/api/auth/login': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Login user',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', format: 'email' },
                                        password: { type: 'string', format: 'password' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Login successful',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    user: { $ref: '#/components/schemas/User' },
                                                    token: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Invalid credentials',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Error' }
                                }
                            }
                        }
                    }
                }
            },
            '/api/auth/refresh-token': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Refresh access token',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'Token refreshed successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    token: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/projects': {
                get: {
                    tags: ['Projects'],
                    summary: 'Get all projects',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'query',
                            name: 'page',
                            schema: { type: 'integer', default: 1 }
                        },
                        {
                            in: 'query',
                            name: 'limit',
                            schema: { type: 'integer', default: 10 }
                        }
                    ],
                    responses: {
                        200: {
                            description: 'List of projects',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    projects: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Project' }
                                                    },
                                                    pagination: {
                                                        type: 'object',
                                                        properties: {
                                                            total: { type: 'integer' },
                                                            page: { type: 'integer' },
                                                            pages: { type: 'integer' }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                post: {
                    tags: ['Projects'],
                    summary: 'Create a new project',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['name', 'description', 'start_date', 'end_date'],
                                    properties: {
                                        name: { type: 'string' },
                                        description: { type: 'string' },
                                        start_date: { type: 'string', format: 'date-time' },
                                        end_date: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: 'Project created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    project: { $ref: '#/components/schemas/Project' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/projects/{id}': {
                get: {
                    tags: ['Projects'],
                    summary: 'Get project by ID',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Project details',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    project: { $ref: '#/components/schemas/Project' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                put: {
                    tags: ['Projects'],
                    summary: 'Update project',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        description: { type: 'string' },
                                        start_date: { type: 'string', format: 'date-time' },
                                        end_date: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Project updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    project: { $ref: '#/components/schemas/Project' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                delete: {
                    tags: ['Projects'],
                    summary: 'Delete project',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Project deleted successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    message: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/tasks': {
                get: {
                    tags: ['Tasks'],
                    summary: 'Get all tasks',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'query',
                            name: 'page',
                            schema: { type: 'integer', default: 1 }
                        },
                        {
                            in: 'query',
                            name: 'limit',
                            schema: { type: 'integer', default: 10 }
                        },
                        {
                            in: 'query',
                            name: 'status',
                            schema: { type: 'string', enum: ['todo', 'in_progress', 'completed'] }
                        },
                        {
                            in: 'query',
                            name: 'project_id',
                            schema: { type: 'string' }
                        }
                    ],
                    responses: {
                        200: {
                            description: 'List of tasks',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    tasks: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Task' }
                                                    },
                                                    pagination: {
                                                        type: 'object',
                                                        properties: {
                                                            total: { type: 'integer' },
                                                            page: { type: 'integer' },
                                                            pages: { type: 'integer' }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                post: {
                    tags: ['Tasks'],
                    summary: 'Create a new task',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['title', 'status', 'due_date', 'image_url', 'project_id'],
                                    properties: {
                                        title: { type: 'string' },
                                        status: { type: 'string', enum: ['todo', 'in_progress', 'completed'] },
                                        due_date: { type: 'string', format: 'date-time' },
                                        image_url: { type: 'string' },
                                        project_id: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: 'Task created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    task: { $ref: '#/components/schemas/Task' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/tasks/{id}': {
                get: {
                    tags: ['Tasks'],
                    summary: 'Get task by ID',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Task details',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    task: { $ref: '#/components/schemas/Task' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                put: {
                    tags: ['Tasks'],
                    summary: 'Update task',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        title: { type: 'string' },
                                        status: { type: 'string', enum: ['todo', 'in_progress', 'completed'] },
                                        due_date: { type: 'string', format: 'date-time' },
                                        image_url: { type: 'string' },
                                        project_id: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Task updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    task: { $ref: '#/components/schemas/Task' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                delete: {
                    tags: ['Tasks'],
                    summary: 'Delete task',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Task deleted successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    message: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/notifications': {
                get: {
                    tags: ['Notifications'],
                    summary: 'Get user notifications',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'query',
                            name: 'page',
                            schema: { type: 'integer', default: 1 }
                        },
                        {
                            in: 'query',
                            name: 'limit',
                            schema: { type: 'integer', default: 10 }
                        },
                        {
                            in: 'query',
                            name: 'read',
                            schema: { type: 'boolean' }
                        }
                    ],
                    responses: {
                        200: {
                            description: 'List of notifications',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    notifications: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Notification' }
                                                    },
                                                    pagination: {
                                                        type: 'object',
                                                        properties: {
                                                            total: { type: 'integer' },
                                                            page: { type: 'integer' },
                                                            pages: { type: 'integer' }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/upload/avatar': {
                post: {
                    tags: ['Upload'],
                    summary: 'Upload an avatar image',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['image'],
                                    properties: {
                                        image: {
                                            type: 'string',
                                            format: 'binary',
                                            description: 'Image file (jpg, jpeg, png)'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Avatar uploaded successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    url: { type: 'string' },
                                                    public_id: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Invalid file type or size',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/upload/project': {
                post: {
                    tags: ['Upload'],
                    summary: 'Upload a project image',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['image'],
                                    properties: {
                                        image: {
                                            type: 'string',
                                            format: 'binary',
                                            description: 'Image file (jpg, jpeg, png, gif)'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Project image uploaded successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    url: { type: 'string' },
                                                    public_id: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Invalid file type or size',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/upload/task': {
                post: {
                    tags: ['Upload'],
                    summary: 'Upload a task image',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['image'],
                                    properties: {
                                        image: {
                                            type: 'string',
                                            format: 'binary',
                                            description: 'Image file (jpg, jpeg, png, gif)'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Task image uploaded successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    url: { type: 'string' },
                                                    public_id: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Invalid file type or size',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/upload/image/{public_id}': {
                delete: {
                    tags: ['Upload'],
                    summary: 'Delete an uploaded image',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'public_id',
                            required: true,
                            schema: { type: 'string' },
                            description: 'Public ID of the image to delete'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Image deleted successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Invalid public ID',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                get: {
                    tags: ['Upload'],
                    summary: 'Get image URL by public ID',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'public_id',
                            required: true,
                            schema: { type: 'string' },
                            description: 'Public ID of the image'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Image URL retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    url: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Invalid public ID',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/health': {
                get: {
                    tags: ['Health'],
                    summary: 'Check API health',
                    responses: {
                        200: {
                            description: 'API is healthy',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    status: { type: 'string' },
                                                    timestamp: { type: 'string', format: 'date-time' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/collaborators/suggestions': {
                get: {
                    tags: ['Collaborators'],
                    summary: 'Get collaborator suggestions',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'List of suggested collaborators',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/User' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/projects/{id}/collaborators': {
                post: {
                    tags: ['Collaborators'],
                    summary: 'Add collaborator to project',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email'],
                                    properties: {
                                        email: {
                                            type: 'string',
                                            format: 'email',
                                            description: 'Email of the user to add as collaborator'
                                        }
                                    },
                                    additionalProperties: false
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Collaborator added successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    project: { $ref: '#/components/schemas/Project' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Validation error',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        403: {
                            description: 'Forbidden - Not project creator',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        404: {
                            description: 'Project or user not found',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/projects/{id}/collaborators/{collaboratorId}': {
                delete: {
                    tags: ['Collaborators'],
                    summary: 'Remove collaborator from project',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'string' }
                        },
                        {
                            in: 'path',
                            name: 'collaboratorId',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Collaborator removed successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    project: { $ref: '#/components/schemas/Project' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.ts'],
};
exports.specs = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map