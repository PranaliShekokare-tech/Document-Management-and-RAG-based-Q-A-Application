import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { UsersService } from 'src/users/users.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userId: string;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);

    //  Ensure admin user exists (hash password if needed)
    const existingAdmin = await usersService.findByUsername('admin');
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('adminpass', 10);
      await usersService.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });
    }

    //  Login as admin
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({  email: 'admin@example.com', password: 'admin123' });

    if (adminLoginRes.status !== 201 && adminLoginRes.status !== 200) {
      console.error(' Failed to login as admin:', adminLoginRes.body);
      throw new Error('Admin login failed');
    }

    adminToken = adminLoginRes.body.access_token;

    console.log('✅ Admin token:', adminToken);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('testpass', 10);

    const user = await usersService.create({
      username: `testuser_${Date.now()}`,
      email: `testuser_${Date.now()}@example.com`,
      password: hashedPassword, 
      role: 'user',
    });

    console.log('Created user:', user);

    expect(user).toHaveProperty('id');
    userId = user.id;
  });

  it('/users/:id/role (PATCH) should update user role', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'editor' })
      .expect(200);

    expect(res.body.role).toBe('editor');
  });

  it('/users/:id (DELETE) should delete a user', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('affected');
  });
});
