import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';

const JWT_SECRET = 'yourSuperSecretJWT';

describe('DocumentsController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let documentId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    token = jwt.sign(
      {
        username: 'admin',
        sub: '095a5684-2328-4b7c-8b03-3bc28503ffe1', // Replace with a real user ID from your test DB
        role: 'admin',
      },
      JWT_SECRET,
      { expiresIn: '1h' },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('/documents (POST) should create a document', async () => {
    const res = await request(app.getHttpServer())
      .post('/documents')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Test Document')
      .field('description', 'Test Description')
      .attach('file', './test/testfile.txt')
      .expect(201);

    console.log('🚀 Create Document Response:', res.body);
    expect(res.body).toHaveProperty('id');

    documentId = res.body.id;
    expect(documentId).toBeDefined();
  });

  it('/documents (GET) should return list', async () => {
    if (!documentId) throw new Error('No documentId set!');

    const res = await request(app.getHttpServer())
      .get('/documents')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/documents/:id (GET) should return single document', async () => {
    if (!documentId) throw new Error('No documentId set!');

    const res = await request(app.getHttpServer())
      .get(`/documents/${documentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', documentId);
  });

  it('/documents/:id (PATCH) should update document', async () => {
    if (!documentId) throw new Error('No documentId set!');

    const res = await request(app.getHttpServer())
      .patch(`/documents/${documentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' })
      .expect(200);

    expect(res.body.title).toBe('Updated Title');
  });

  it('/documents/:id (DELETE) should delete document', async () => {
    if (!documentId) throw new Error('No documentId set!');

    const res = await request(app.getHttpServer())
      .delete(`/documents/${documentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', documentId);
  });
});