import mongoose from 'mongoose';
import { env } from '../config/env';

// Global setup
beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(env.MONGODB_URI);
});

// Global teardown
afterAll(async () => {
  // Drop test database
  await mongoose.connection.dropDatabase();
  // Close connection
  await mongoose.connection.close();
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
}); 