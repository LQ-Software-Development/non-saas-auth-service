import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module'; // Ajuste o caminho se necessário
import { Model } from 'mongoose';
import { UserSchemaInterface } from './../src/auth/database/providers/schema/user.schema'; // Ajuste o caminho se necessário
import { Organization } from './../src/organizations/entities/organization.schema'; // Importar Organization
import { Participant } from './../src/organizations/participants/entities/participant.entity'; // Importar Participant
import { getModelToken } from '@nestjs/mongoose'; // Importar getModelToken
import * as bcrypt from 'bcrypt'; // Importar bcrypt

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<UserSchemaInterface>; // Variável para o modelo Mongoose
  let organizationModel: Model<Organization>; // Modelo Organization
  let participantModel: Model<Participant>; // Modelo Participant

  // Obter Models adicionais para acessos, se necessário (a ser implementado depois)
  // let participantModel: Model<Participant>;
  // let organizationModel: Model<Organization>;

  const saltRounds = 10; // Custo para bcrypt

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();

    userModel = moduleFixture.get<Model<UserSchemaInterface>>('AUTH_USER_MODEL');
    organizationModel = moduleFixture.get<Model<Organization>>(getModelToken(Organization.name));
    participantModel = moduleFixture.get<Model<Participant>>(getModelToken(Participant.name));
    // Obter outros models:
    // participantModel = moduleFixture.get<Model<Participant>>('ParticipantModelToken'); // Substituir pelo token correto
    // organizationModel = moduleFixture.get<Model<Organization>>('OrganizationModelToken'); // Substituir pelo token correto
  });

  // Limpeza Global antes de CADA teste
  beforeEach(async () => {
    // Critério de limpeza: marcador no metadata
    const testMarkerCriteria = { 'metadata.testMarker': 'e2e-test' };
    
    // Limpar em ordem inversa de dependência (aproximada): Participants -> Organizations -> Users
    await participantModel.deleteMany(testMarkerCriteria);
    await organizationModel.deleteMany(testMarkerCriteria);
    await userModel.deleteMany(testMarkerCriteria);
    console.log('Cleaned test data based on marker.'); // Log para confirmar limpeza
  });

  // Limpeza Global Final após TUDO
  afterAll(async () => {
    const testMarkerCriteria = { 'metadata.testMarker': 'e2e-test' };
    await participantModel.deleteMany(testMarkerCriteria);
    await organizationModel.deleteMany(testMarkerCriteria);
    await userModel.deleteMany(testMarkerCriteria);
    console.log('Final cleanup completed.'); // Log para confirmar limpeza

    await app.close();
  });

  // --- Testes de Login --- 
  describe('/login (POST)', () => {
    const loginUrl = '/login'; 
    let testUserId: string;
    let testOrgId: string; 
    let testParticipantId: string; 

    const testUserEmail = 'test.e2e@test.com';
    const testUserPhone = '99999999999'; 
    const testUserPassword = 'password123'; 
    let hashedPassword = ''; // Declarar aqui para escopo
    
    // MUDADO DE beforeAll PARA beforeEach: Criar usuário de teste ANTES DE CADA TESTE neste bloco
    beforeEach(async () => {
      hashedPassword = bcrypt.hashSync(testUserPassword, saltRounds);
      const createdUser = await userModel.create({
        email: testUserEmail,
        phone: testUserPhone,
        password: hashedPassword,
        name: 'Test User E2E',
        verifiedEmail: true, 
        metadata: { testMarker: 'e2e-test' } // Marcador para limpeza
      });
      testUserId = createdUser._id.toString();
      console.log(`Test user created/recreated for test: ${testUserId}`); // Log atualizado

      // TODO: Mover criação de Organization/Participant para cá também, 
      // ou para um beforeEach específico dos testes que precisam deles,
      // se quisermos verificar os acessos nos testes básicos.
      // Por enquanto, deixaremos a criação de acessos apenas no teste do bug.
    });

    // afterAll específico do bloco removido (limpeza global cuidará)

    it('should successfully login with correct email and password', async () => {
      const response = await request(app.getHttpServer())
        .post(loginUrl)
        .send({ email: testUserEmail, password: testUserPassword })
        .expect(201); 
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('userId', testUserId);
      expect(response.body).toHaveProperty('accesses');
      // TODO: Verificar o conteúdo de 'accesses' com base nos dados criados
    });

    it('should successfully login with correct phone and password', async () => {
      const response = await request(app.getHttpServer())
        .post(loginUrl)
        .send({ phone: testUserPhone, password: testUserPassword })
        .expect(201); 
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('userId', testUserId);
      expect(response.body).toHaveProperty('accesses');
      // TODO: Verificar o conteúdo de 'accesses'
    });

    it('should fail login with incorrect password', async () => {
      await request(app.getHttpServer())
        .post(loginUrl)
        .send({ email: testUserEmail, password: 'wrongpassword' })
        .expect(403); 
    });

    it('should fail login with non-existent email', async () => {
      await request(app.getHttpServer())
        .post(loginUrl)
        .send({ email: 'nonexistent@test.com', password: testUserPassword })
        .expect(403); 
    });

    it('should fail login with non-existent phone', async () => {
        await request(app.getHttpServer())
          .post(loginUrl)
          .send({ phone: '11111111111', password: testUserPassword })
          .expect(403); 
      });

    // TODO: Implementar teste específico para verificar o bug dos acessos incorretos
    describe('when dealing with potentially conflicting accesses', () => {
      let userAId: string;
      let userBId: string;
      let orgAId: string;
      let orgBId: string;
      const userAEmail = 'user-a.e2e@test.com';
      const userBPhone = '11223344555'; // Telefone diferente para User B
      const commonPassword = 'sharedPassword123';

      beforeEach(async () => {
        // Criar cenário para o bug:
        // User A (email, senha comum, acesso Org A como 'member')
        // User B (telefone, mesma senha comum, acesso Org B como 'admin')
        const hashedCommonPassword = bcrypt.hashSync(commonPassword, saltRounds);
        
        const userA = await userModel.create({ 
          email: userAEmail, name: 'User A', password: hashedCommonPassword, 
          metadata: { testMarker: 'e2e-test' }
        });
        userAId = userA._id.toString();

        const userB = await userModel.create({ 
          phone: userBPhone, name: 'User B', password: hashedCommonPassword, 
          metadata: { testMarker: 'e2e-test' }
        });
        userBId = userB._id.toString();

        const orgA = await organizationModel.create({ name: 'Org A', ownerId: 'some-other-user', metadata: { testMarker: 'e2e-test' }});
        orgAId = orgA._id.toString();
        await participantModel.create({ organizationId: orgAId, email: userAEmail, role: 'member', name: 'User A', metadata: { testMarker: 'e2e-test' }});

        const orgB = await organizationModel.create({ name: 'Org B', ownerId: 'yet-another-user', metadata: { testMarker: 'e2e-test' }});
        orgBId = orgB._id.toString();
        await participantModel.create({ organizationId: orgBId, phone: userBPhone, role: 'admin', name: 'User B', metadata: { testMarker: 'e2e-test' }});
      });

      // A limpeza geral no beforeEach externo deve cuidar desses dados

      it('should return ONLY accesses for User B when logging in with User B phone', async () => {
        const response = await request(app.getHttpServer())
          .post(loginUrl)
          .send({ phone: userBPhone, password: commonPassword })
          .expect(201);

        expect(response.body.userId).toBe(userBId);
        expect(response.body.accesses).toBeDefined();
        expect(response.body.accesses).toHaveLength(1);
        expect(response.body.accesses[0].id).toBe(orgBId);
        expect(response.body.accesses[0].role).toBe('admin');
        expect(response.body.accesses[0].name).toBe('Org B');
      });

      // Poderia adicionar um teste simétrico fazendo login com User A e verificando Org A
    });

    // --- NOVO TESTE PARA BUG DE PARTICIPANTE COM MÚLTIPLOS NULLS --- 
    describe('when dealing with a participant with multiple null fields', () => {
      let userCId: string; // Usuário com phone e document null
      let orgXId: string;  // Org com participante "vazio"
      const userCEmail = 'user-c-multi-null.e2e@test.com';
      const password = 'password123';
      const genericParticipantRole = 'generic_access';

      beforeEach(async () => {
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        const testMarker = { metadata: { testMarker: 'e2e-test' } };

        // 1. Org X e seu Participante "Vazio"
        const orgX = await organizationModel.create({ name: 'Org X Generic', ownerId: 'some-other-user', ...testMarker });
        orgXId = orgX._id.toString();
        await participantModel.create({ 
          organizationId: orgXId, 
          email: null, // Email NULO
          phone: null, // Phone NULO
          document: null, // Document NULO
          role: genericParticipantRole, 
          name: 'Participant X Multi Null', 
          ...testMarker
        });

        // 2. User C (com phone e document null)
        const userC = await userModel.create({ 
          email: userCEmail, // Email válido para login
          phone: null, // Phone NULO
          document: null, // Document NULO
          name: 'User C Multi Null', 
          password: hashedPassword, 
          ...testMarker 
        });
        userCId = userC._id.toString();
      });

      // A limpeza global no beforeEach externo cuidará desses dados

      it('should return NO accesses when logging in as User C (matching multi-null participant)', async () => {
        const response = await request(app.getHttpServer())
          .post(loginUrl)
          .send({ email: userCEmail, password: password }) // Login com email do User C
          .expect(201);

        expect(response.body.userId).toBe(userCId);
        expect(response.body.accesses).toBeDefined();
        // Se o bug existir, este expect falhará, pois retornará Org X com role 'generic_access'
        expect(response.body.accesses).toHaveLength(0); 
      });
    });

  });

}); 