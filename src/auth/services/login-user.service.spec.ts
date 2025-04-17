import { Test, TestingModule } from '@nestjs/testing';
import { LoginUserService } from './login-user.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../database/providers/schema/user.schema';
import { Participant } from '../../organizations/participants/entities/participant.entity';
import { Organization } from '../../organizations/entities/organization.schema';
import { Model, Types } from 'mongoose';
import { LoginUserDto } from '../dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { ForbiddenException } from '@nestjs/common';

// Tipos Mock para Mongoose Model
type MockModel<T = any> = Partial<Record<keyof Model<T>, jest.Mock>>;

// Função para criar um mock básico do Model
const createMockModel = <T = any>(): MockModel<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  exists: jest.fn(),
  // Adicione outros métodos do Mongoose que podem ser usados se necessário
});

describe('LoginUserService', () => {
  let service: LoginUserService;
  let jwtService: JwtService;
  let userModel: MockModel<User>;
  let participantModel: MockModel<Participant>;
  let organizationModel: MockModel<Organization>;

  // --- Dados Mock Comuns ---
  const mockUserId = new Types.ObjectId();
  const mockUserIdString = mockUserId.toString();
  const mockPassword = 'password123';
  const mockHashedPassword = bcrypt.hashSync(mockPassword, 10);
  const mockJwtToken = 'mock.jwt.token';

  const mockUserBase = {
    _id: mockUserId,
    name: 'Test User',
    password: mockHashedPassword,
    verifiedEmail: true,
    // email, phone, document serão adicionados por cenário
  };

  // Array global para simular o banco de participantes
  let fakeParticipants: any[] = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserService,
        {
          provide: 'jwt-service',
          useValue: {
            sign: jest.fn().mockReturnValue(mockJwtToken),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: createMockModel<User>(),
        },
        {
          provide: getModelToken(Participant.name),
          useValue: createMockModel<Participant>(),
        },
        {
          provide: getModelToken(Organization.name),
          useValue: createMockModel<Organization>(),
        },
      ],
    }).compile();

    service = module.get<LoginUserService>(LoginUserService);
    jwtService = module.get<JwtService>('jwt-service');
    userModel = module.get(getModelToken(User.name));
    participantModel = module.get(getModelToken(Participant.name));
    organizationModel = module.get(getModelToken(Organization.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Testes de Lógica de Login e Acesso ---
  describe('login method', () => {

    // Helper para mock de findOne do userModel
    const mockUserModelFindOne = (userToReturn: any) => {
        userModel.findOne.mockReturnValue({
            lean: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(userToReturn),
        });
    };

    // --- Mock Refatorado para participantModel.find ---
    // Recebe um objeto descrevendo os participantes primários e secundários esperados
    const mockParticipantModelFindImplementation = () => {
      participantModel.find.mockImplementation((query: any) => {
        let result = fakeParticipants;

        if (query?.$and) {
          query.$and.forEach((cond: any) => {
            if (cond.email) result = result.filter(p => p.email === cond.email);
            if (cond.phone) result = result.filter(p => p.phone === cond.phone);
            if (cond.document) result = result.filter(p => p.document === cond.document);
            if (cond.$or) {
              result = result.filter(p =>
                cond.$or.some((orCond: any) => {
                  // Filtro especial para deletedAt
                  if (orCond.deletedAt && orCond.deletedAt.$exists === false) {
                    return p.deletedAt === undefined;
                  }
                  if (orCond.deletedAt === null) {
                    return p.deletedAt === null;
                  }
                  // Outros campos
                  return Object.keys(orCond).some(key => p[key] === orCond[key]);
                })
              );
            }
            if (cond._id && cond._id.$nin) {
              result = result.filter(p => !cond._id.$nin.includes(p._id));
            }
            // O filtro de deletedAt direto não é mais necessário, pois já está coberto pelo $or
          });
        }

        return {
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(result),
        };
      });
    };

    // Helper para mock de find do organizationModel
     const mockOrganizationModelFind = (orgsToReturn: any[]) => {
        organizationModel.find.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(orgsToReturn),
        });
    };

     // Helper para mock de exists do organizationModel
     const mockOrganizationModelExists = (existsResult: boolean) => {
         organizationModel.exists.mockResolvedValue(existsResult);
     };

    it('should throw ForbiddenException if user not found', async () => {
      mockUserModelFindOne(null);
      const loginDto: LoginUserDto = { email: 'not@found.com', password: mockPassword };

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if password does not match', async () => {
      mockUserModelFindOne({ ...mockUserBase, email: 'user@test.com'});
      const loginDto: LoginUserDto = { email: 'user@test.com', password: 'wrongpassword' };

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    // --- Cenário 1: Login por Email, Acesso por Telefone (Válido) ---
    it('should return access found via secondary (phone) identifier without conflicts', async () => {
        // Setup User
        const userEmail = 'user1@test.com';
        const userPhone = '111111111';
        const mockUser = { ...mockUserBase, email: userEmail, phone: userPhone }; 
        mockUserModelFindOne(mockUser);
        
        // Setup Participant (encontrado SÓ na busca secundária)
        const mockOrgId1 = new Types.ObjectId();
        const mockParticipant1 = { _id: new Types.ObjectId(), organizationId: mockOrgId1.toString(), phone: userPhone, email: null, role: 'member', deletedAt: undefined }; // Phone corresponde, email null (sem conflito)
        
        // Usar o novo mock:
        fakeParticipants = [mockParticipant1];
        mockParticipantModelFindImplementation();

        // Setup Organization
        const mockOrg1 = { _id: mockOrgId1.toString(), name: 'Org 1', ownerId: 'other' };
        mockOrganizationModelFind([mockOrg1]);
        mockOrganizationModelExists(false); // User não é dono de nenhuma org

        // Executar
        const loginDto: LoginUserDto = { email: userEmail, password: mockPassword };
        const result = await service.login(loginDto);
        const accesses = result.value.accesses;

        // Assert
        expect(result.isSuccess).toBe(true);
        expect(accesses).toHaveLength(1);
        expect(accesses[0].id).toBe(mockOrgId1.toString());
        expect(accesses[0].role).toBe('member');
        expect(accesses[0].participantId).toEqual(mockParticipant1._id);
    });

    // --- Cenário 2: Login por Email, Acesso por Telefone (Inválido - Email Divergente) ---
    it('should REJECT access found via secondary (phone) identifier due to email conflict', async () => {
        // Setup User
        const userEmail = 'user2@test.com';
        const userPhone = '222222222';
        const mockUser = { ...mockUserBase, email: userEmail, phone: userPhone }; 
        mockUserModelFindOne(mockUser);
        
        // Setup Participant (encontrado SÓ na busca secundária, mas com email conflitante)
        const mockOrgId2 = new Types.ObjectId();
        const conflictingEmail = 'different@email.com';
        const mockParticipant2 = { _id: new Types.ObjectId(), organizationId: mockOrgId2.toString(), phone: userPhone, email: conflictingEmail, role: 'guest', deletedAt: undefined }; 
        
        // Usar o novo mock:
        fakeParticipants = [mockParticipant2];
        mockParticipantModelFindImplementation();

        // Setup Organization (será encontrada, mas o participante será rejeitado)
        const mockOrg2 = { _id: mockOrgId2.toString(), name: 'Org 2', ownerId: 'other' };
        mockOrganizationModelFind([mockOrg2]);
        mockOrganizationModelExists(false); 

        // Executar
        const loginDto: LoginUserDto = { email: userEmail, password: mockPassword };
        const result = await service.login(loginDto);
        const accesses = result.value.accesses;

        // Assert: Nenhum acesso deve ser retornado, pois o participante foi invalidado
        expect(result.isSuccess).toBe(true);
        expect(accesses).toHaveLength(0); 
    });

    // --- Cenário 3: Login por Telefone, Acesso por Email (Válido) ---
    it('should return access found via secondary (email) identifier without conflicts', async () => {
         // Setup User
        const userEmail = 'user3@test.com';
        const userPhone = '333333333';
        const mockUser = { ...mockUserBase, email: userEmail, phone: userPhone }; 
        mockUserModelFindOne(mockUser);
        
        // Setup Participant (encontrado SÓ na busca secundária por email)
        const mockOrgId3 = new Types.ObjectId();
        const mockParticipant3 = { _id: new Types.ObjectId(), organizationId: mockOrgId3.toString(), email: userEmail, phone: null, role: 'editor', deletedAt: undefined }; 
        
        // Usar o novo mock:
        fakeParticipants = [mockParticipant3];
        mockParticipantModelFindImplementation();

        // Setup Organization
        const mockOrg3 = { _id: mockOrgId3.toString(), name: 'Org 3', ownerId: 'other' };
        mockOrganizationModelFind([mockOrg3]);
        mockOrganizationModelExists(false);

        // Executar
        const loginDto: LoginUserDto = { phone: userPhone, password: mockPassword }; // Login por telefone
        const result = await service.login(loginDto);
        const accesses = result.value.accesses;

        // Assert
        expect(result.isSuccess).toBe(true);
        expect(accesses).toHaveLength(1);
        expect(accesses[0].id).toBe(mockOrgId3.toString());
        expect(accesses[0].role).toBe('editor');
        expect(accesses[0].participantId).toEqual(mockParticipant3._id);
    });

    // --- Cenário 4: Login por Telefone, Acesso por Email (Inválido - Documento Divergente) ---
    it('should REJECT access found via secondary (email) identifier due to document conflict', async () => {
        // Setup User
        const userEmail = 'user4@test.com';
        const userPhone = '444444444';
        const userDocument = '123456789';
        const mockUser = { ...mockUserBase, email: userEmail, phone: userPhone, document: userDocument }; 
        mockUserModelFindOne(mockUser);
        
        // Setup Participant (encontrado SÓ na busca secundária por email, mas doc conflitante)
        const mockOrgId4 = new Types.ObjectId();
        const conflictingDocument = '987654321';
        const mockParticipant4 = { _id: new Types.ObjectId(), organizationId: mockOrgId4.toString(), email: userEmail, phone: null, document: conflictingDocument, role: 'viewer', deletedAt: undefined }; 
        
        // Usar o novo mock:
        fakeParticipants = [mockParticipant4];
        mockParticipantModelFindImplementation();

        // Setup Organization
        const mockOrg4 = { _id: mockOrgId4.toString(), name: 'Org 4', ownerId: 'other' };
        mockOrganizationModelFind([mockOrg4]);
        mockOrganizationModelExists(false);

        // Executar
        const loginDto: LoginUserDto = { phone: userPhone, password: mockPassword }; // Login por telefone
        const result = await service.login(loginDto);
        const accesses = result.value.accesses;

        // Assert: Nenhum acesso retornado
        expect(result.isSuccess).toBe(true);
        expect(accesses).toHaveLength(0);
    });

    // --- Cenário 5: Múltiplos Acessos Válidos (Primário + Secundário) ---
    it('should return accesses found via primary (email) and secondary (phone) identifiers', async () => {
        // Setup User
        const userEmail = 'user5@test.com';
        const userPhone = '555555555';
        const mockUser = { ...mockUserBase, email: userEmail, phone: userPhone }; 
        mockUserModelFindOne(mockUser);
        
        // Setup Participants
        const mockOrgId5 = new Types.ObjectId();
        const mockParticipant5 = { _id: new Types.ObjectId(), organizationId: mockOrgId5.toString(), email: userEmail, role: 'admin', deletedAt: undefined }; // Primário (email)
        const mockOrgId6 = new Types.ObjectId();
        const mockParticipant6 = { _id: new Types.ObjectId(), organizationId: mockOrgId6.toString(), phone: userPhone, role: 'member', deletedAt: undefined }; // Secundário (phone)

        // Usar o novo mock:
        fakeParticipants = [mockParticipant5, mockParticipant6];
        mockParticipantModelFindImplementation();

        // Setup Organizations
        const mockOrg5 = { _id: mockOrgId5.toString(), name: 'Org 5', ownerId: 'other' };
        const mockOrg6 = { _id: mockOrgId6.toString(), name: 'Org 6', ownerId: 'other' };
        mockOrganizationModelFind([mockOrg5, mockOrg6]);
        mockOrganizationModelExists(false);

        // Executar
        const loginDto: LoginUserDto = { email: userEmail, password: mockPassword }; // Login por email
        const result = await service.login(loginDto);
        const accesses = result.value.accesses;

        // --- DEBUG LOGS FOR SCENARIO 5 ---
        console.log('--- Scenario 5 Debug --- Rerun ---');
        console.log('Org 5 ID:', mockOrgId5.toString());
        console.log('Org 6 ID:', mockOrgId6.toString());
        console.log('Participant 5 (Primary - Email):', JSON.stringify(mockParticipant5));
        console.log('Participant 6 (Secondary - Phone):', JSON.stringify(mockParticipant6));
        // Logar o que foi passado para organizationModel.find (se possível, ou o resultado)
        // console.log('Organizations Found:', /* como pegar o resultado do mock? */);
        // Logar allValidParticipants ANTES do map seria ideal, mas não temos acesso direto a ele aqui.
        console.log('Received Accesses Array:', JSON.stringify(accesses, null, 2));
        console.log('--- End Scenario 5 Debug ---');

        // Assert: Deve retornar ambos os acessos
        expect(result.isSuccess).toBe(true);
        expect(accesses).toHaveLength(2);
        expect(accesses).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: mockOrgId5.toString(), role: 'admin', participantId: mockParticipant5._id }),
            expect.objectContaining({ id: mockOrgId6.toString(), role: 'member', participantId: mockParticipant6._id })
        ]));
    });

    // --- Cenário 6: Acesso Primário Válido + Secundário Inválido ---
    it('should return primary access but reject secondary access due to conflict', async () => {
        // Setup User
        const userEmail = 'user6@test.com';
        const userPhone = '666666666';
        const mockUser = { ...mockUserBase, email: userEmail, phone: userPhone }; 
        mockUserModelFindOne(mockUser);
        
        // Setup Participants
        const mockOrgId7 = new Types.ObjectId();
        const mockParticipant7 = { _id: new Types.ObjectId(), organizationId: mockOrgId7.toString(), email: userEmail, role: 'manager', deletedAt: undefined }; // Primário (email)
        const mockOrgId8 = new Types.ObjectId();
        const conflictingEmail = 'another@email.net';
        const mockParticipant8 = { _id: new Types.ObjectId(), organizationId: mockOrgId8.toString(), phone: userPhone, email: conflictingEmail, role: 'intern', deletedAt: undefined }; // Secundário (phone), mas email conflitante

        // Usar o novo mock:
        fakeParticipants = [mockParticipant7, mockParticipant8];
        mockParticipantModelFindImplementation();

        // Setup Organizations
        const mockOrg7 = { _id: mockOrgId7.toString(), name: 'Org 7', ownerId: 'other' };
        mockOrganizationModelFind([mockOrg7]); // Só retorna a organização do participante primário
        mockOrganizationModelExists(false);

        // Executar
        const loginDto: LoginUserDto = { email: userEmail, password: mockPassword }; // Login por email
        const result = await service.login(loginDto);
        const accesses = result.value.accesses;

        // Assert: Deve retornar apenas o acesso primário
        expect(result.isSuccess).toBe(true);
        expect(accesses).toHaveLength(1);
        expect(accesses[0].id).toBe(mockOrgId7.toString());
        expect(accesses[0].role).toBe('manager');
        expect(accesses[0].participantId).toEqual(mockParticipant7._id);
    });

    // --- Cenário 7: Apenas Dono ---
    it('should return access as owner if user is owner and no participant found', async () => {
        // Setup User
        const userEmail = 'user7@test.com';
        const mockUser = { ...mockUserBase, email: userEmail }; 
        mockUserModelFindOne(mockUser);
        
        // Usar o novo mock:
        fakeParticipants = [];
        mockParticipantModelFindImplementation();

        // Setup Organization (usuário é o dono)
        const mockOrgId9 = new Types.ObjectId();
        const mockOrg9 = { _id: mockOrgId9.toString(), name: 'Org 9', ownerId: mockUserIdString }; // ownerId corresponde
        mockOrganizationModelFind([mockOrg9]);
        mockOrganizationModelExists(true); // User é dono

        // Executar
        const loginDto: LoginUserDto = { email: userEmail, password: mockPassword };
        const result = await service.login(loginDto);
        const accesses = result.value.accesses;

        // Assert: Deve retornar o acesso como owner
        expect(result.isSuccess).toBe(true);
        expect(accesses).toHaveLength(1);
        expect(accesses[0].id).toBe(mockOrgId9.toString());
        expect(accesses[0].role).toBe('owner');
        expect(accesses[0].participantId).toBeUndefined();
    });

    // --- Cenário 8: Sem Acessos ---
     it('should return empty accesses if no participant found and user is not owner', async () => {
        // Setup User
        const userEmail = 'user8@test.com';
        const mockUser = { ...mockUserBase, email: userEmail }; 
        mockUserModelFindOne(mockUser);
        
        // Usar o novo mock:
        fakeParticipants = [];
        mockParticipantModelFindImplementation();

        // Setup Organization (nenhuma org encontrada para este usuário)
        mockOrganizationModelFind([]);
        mockOrganizationModelExists(false); // User não é dono

        // Executar
        const loginDto: LoginUserDto = { email: userEmail, password: mockPassword };
        const result = await service.login(loginDto);
        const accesses = result.value.accesses;

        // Assert: Deve retornar array vazio
        expect(result.isSuccess).toBe(true);
        expect(accesses).toHaveLength(0);
    });

    // TODO: Adicionar testes para casos de borda (identificadores vazios/nulos no usuário, etc.)

  });
}); 