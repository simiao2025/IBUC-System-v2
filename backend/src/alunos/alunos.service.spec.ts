import { Test, TestingModule } from '@nestjs/testing';
import { AlunosService, CreateAlunoDto } from './alunos.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('AlunosService - Testes de Caracterização', () => {
  let service: AlunosService;
  let supabaseMock: any;

  const mockAdminClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    supabaseMock = {
      getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlunosService,
        { provide: SupabaseService, useValue: supabaseMock },
      ],
    }).compile();

    service = module.get<AlunosService>(AlunosService);
    jest.clearAllMocks();
  });

  describe('criarAluno', () => {
    const createDto: CreateAlunoDto = {
      nome: 'Aluno Teste',
      data_nascimento: '2010-01-01',
      sexo: 'M',
      polo_id: 'polo-id',
      nivel_atual_id: 'nivel-id',
      cpf: '123.456.789-00',
      email_responsavel: 'resp@teste.com',
      endereco: { rua: 'Rua A', numero: '123' },
      alergias: 'Nenhuma',
    };

    it('deve caracterizar o fluxo de inserção híbrida (comportamento atual)', async () => {
      // 1. Mocks de verificação inicial
      mockAdminClient.single
        .mockResolvedValueOnce({ data: { id: 'polo-id' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'nivel-id' }, error: null });

      // 2. Mock do Aluno criado
      mockAdminClient.single.mockResolvedValueOnce({ 
        data: { id: 'aluno-uuid', ...createDto }, 
        error: null 
      });

      // 3. Mock verificação usuário
      mockAdminClient.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

      // 4. Mock criação usuário
      mockAdminClient.single.mockResolvedValueOnce({ 
        data: { id: 'user-uuid' }, 
        error: null 
      });

      await service.criarAluno(createDto);

      // CARACTERIZAÇÃO: O sistema atual envia o objeto 'endereco' integralmente para o banco
      expect(mockAdminClient.insert).toHaveBeenCalledWith(expect.objectContaining({
        nome: 'Aluno Teste',
        endereco: { rua: 'Rua A', numero: '123' }
      }));
    });
  });

  describe('buscarAlunoPorId', () => {
    it('deve caracterizar o contrato de joins do Supabase', async () => {
      mockAdminClient.single.mockResolvedValue({ 
        data: { id: '123' }, 
        error: null 
      });

      await service.buscarAlunoPorId('123');

      // CARACTERIZAÇÃO: O sistema depende desses aliases e FKs específicos para o frontend
      expect(mockAdminClient.select).toHaveBeenCalledWith(expect.stringContaining('turma:turmas!fk_turma'));
      expect(mockAdminClient.select).toHaveBeenCalledWith(expect.stringContaining('nivel:niveis!fk_nivel'));
    });
  });
});
