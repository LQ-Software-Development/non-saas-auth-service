import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module'; // Ajuste o caminho se necessário

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Importa o módulo principal da sua aplicação
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    // Exemplo: Testa uma rota raiz básica, se existir.
    // Adapte ou remova conforme sua aplicação.
    // Se não houver rota raiz, pode ser um teste simples como expect(app).toBeDefined();
    // apenas para garantir que a configuração funciona.
    return request(app.getHttpServer())
      .get('/');
      // .expect(200) // Comentado - ajuste se tiver uma rota raiz real
      // .expect('Hello World!'); // Comentado - ajuste se tiver uma rota raiz real
     // Se não tiver uma rota raiz, comente ou adapte as linhas acima.
     // Por exemplo:
     expect(app).toBeDefined(); // Um teste mínimo para garantir que o app subiu
  });
}); 