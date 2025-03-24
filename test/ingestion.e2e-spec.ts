import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('IngestionController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let ingestionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });

    token = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ingestion/trigger/:documentId (POST) - should trigger ingestion', async () => {
    const res = await request(app.getHttpServer())
      .post('/ingestion/trigger/sample-doc-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ some: 'payload' })
      .expect(201);

    ingestionId = res.body.id;

    expect(res.body.message).toBeDefined();
    expect(ingestionId).toBeDefined();
  });

  it('/ingestion/status/:id (GET) - should return ingestion status', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ingestion/status/${ingestionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('status');
    expect(res.body.id).toBe(ingestionId);
  });

  it('/ingestion/retry/:id (POST) - should retry ingestion', async () => {
    const res = await request(app.getHttpServer())
      .post(`/ingestion/retry/${ingestionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(res.body.message).toBeDefined();
  });

  it('/ingestion/all (GET) - should return all ingestions', async () => {
    const res = await request(app.getHttpServer())
      .get('/ingestion/all')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
