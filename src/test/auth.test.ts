import request from 'supertest';
import { createApp } from '../app';
import database from '../config/database';
import { UserRepository } from '../modules/user/repositories/UserRepository';
import { UserRole } from '../types';

const app = createApp();
const userRepository = new UserRepository();

describe('Authentication API', () => {
  beforeAll(async () => {
    await database.connect();
  });

  afterAll(async () => {
    await database.clearDatabase();
    await database.disconnect();
  });

  beforeEach(async () => {
    await database.clearDatabase();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        role: UserRole.STUDENT
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should fail to register with invalid email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        role: UserRole.STUDENT
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should fail to register with weak password', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        role: UserRole.STUDENT
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should fail to register with mismatched passwords', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
        role: UserRole.STUDENT
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await userRepository.createUser({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        role: UserRole.STUDENT
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'john.doe@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should fail to login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should fail to login with invalid password', async () => {
      const loginData = {
        email: 'john.doe@example.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is running');
      expect(response.body.data.timestamp).toBeDefined();
    });
  });
});
