# TaskSphere Backend

A robust backend API for the TaskSphere project management application.

## Features

- User authentication with JWT
- Project management
- Task management
- File uploads (AWS S3 or Cloudinary)
- API documentation with Swagger
- Comprehensive test suite

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tasksphere-backend.git
cd tasksphere-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and configure your environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration values.

## Development

Start the development server:
```bash
npm run dev
```

The server will start at `http://localhost:3000`.

## API Documentation

Access the Swagger documentation at `http://localhost:3000/api-docs`.

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Environment Variables

- `NODE_ENV`: Environment (development, test, production)
- `PORT`: Server port
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- `JWT_EXPIRES_IN`: JWT token expiration time
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration time
- `AWS_ACCESS_KEY_ID`: AWS access key (optional)
- `AWS_SECRET_ACCESS_KEY`: AWS secret key (optional)
- `AWS_REGION`: AWS region (optional)
- `AWS_S3_BUCKET`: AWS S3 bucket name (optional)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name (optional)
- `CLOUDINARY_API_KEY`: Cloudinary API key (optional)
- `CLOUDINARY_API_SECRET`: Cloudinary API secret (optional)

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── docs/          # Documentation
├── middleware/    # Custom middleware
├── models/        # Mongoose models
├── routes/        # API routes
├── services/      # Business logic
├── utils/         # Utility functions
├── app.ts         # Express app
└── server.ts      # Server entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 