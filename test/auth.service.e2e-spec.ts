import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        username: 'testuser',
        email: `testuser_${Date.now()}@example.com`,
        password: 'Password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);  // ✅ Expect 201 for register

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toEqual(registerDto.email);
    });

    it('should fail to register with existing email', async () => {
      const email = `duplicate_${Date.now()}@example.com`;
      const registerDto = {
        username: 'duplicateuser',
        email,
        password: 'Password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully and return access token', async () => {
      const email = `loginuser_${Date.now()}@example.com`;
      const password = 'Password123';

      const registerDto = {
        username: 'loginuser',
        email,
        password,
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
    });

    it('should fail to login with wrong password', async () => {
      const email = `failuser_${Date.now()}@example.com`;
      const password = 'Password123';

      const registerDto = {
        username: 'failuser',
        email,
        password,
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'WrongPassword' })
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout user (dummy response)', async () => {
      const email = `logoutuser_${Date.now()}@example.com`;
      const password = 'Password123';

      const registerDto = {
        username: 'logoutuser',
        email,
        password,
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);

      const token = loginResponse.body.access_token;

      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Logout successful');
    });
  });
});
