import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/educational_management_test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_purposes_only';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_for_testing_purposes_only';

// Increase timeout for database operations
jest.setTimeout(30000);
