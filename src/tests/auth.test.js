import request from 'supertest';
import app from '../app.js';
import prisma from '../lib/prisma.js';
import { hashPassword } from '../utils/password.js';

// Basic integration tests for auth flow

describe('Auth API', () => {
  const email = 'test@example.com';
  const password = 'Password123!';
  const name = 'Tester';

  beforeAll(async () => {
    // Ensure db connection
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  test('signup creates user and returns tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email, password, name });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  test('login returns tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  test('me returns user with valid token', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({ email, password });
    const token = login.body.accessToken;
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
  });

  test('refresh issues new tokens', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({ email, password });
    const r = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: login.body.refreshToken });
    expect(r.status).toBe(200);
    expect(r.body.accessToken).toBeDefined();
  });
});
