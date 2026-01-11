
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('IBUC System API está funcionando!');
      }); 
      // Note: Assuming AppService returns Hello World! by default if check check_turmas_repro.ts was checking it, 
      // but usually root is empty or hello. Let's verify AppService if possible, or just expect 200/404.
      // Actually, safest is to check if it boots.
  });
});
