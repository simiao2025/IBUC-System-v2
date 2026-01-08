import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementService } from './user-management.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserManagementService', () => {
    let service: UserManagementService;

    const mockAdminClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        single: jest.fn(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserManagementService,
                {
                    provide: SupabaseService,
                    useValue: {
                        getAdminClient: () => mockAdminClient,
                    },
                },
            ],
        }).compile();

        service = module.get<UserManagementService>(UserManagementService);
    });

    describe('buscarUsuarioPorId', () => {
        it('should return user if found', async () => {
            const mockUserData = { id: '1', nome_completo: 'Test User', polo_id: null };
            mockAdminClient.single.mockResolvedValueOnce({ data: mockUserData, error: null });

            const result = await service.buscarUsuarioPorId('1');
            expect(result.id).toBe('1');
            expect(mockAdminClient.from).toHaveBeenCalledWith('usuarios');
        });

        it('should throw NotFoundException if user not found', async () => {
            mockAdminClient.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } });
            await expect(service.buscarUsuarioPorId('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('criarUsuario', () => {
        it('should throw BadRequestException if email already registered', async () => {
            // First call check existing email
            mockAdminClient.single.mockResolvedValueOnce({ data: { id: 'ext' }, error: null });

            await expect(service.criarUsuario({ email: 'taken@ex.com', nome_completo: 'Test', role: 'admin' }))
                .rejects.toThrow(BadRequestException);
        });

        it('should create user successfully', async () => {
            // Email check: Not found
            mockAdminClient.single.mockResolvedValueOnce({ data: null, error: null });
            // Insert result
            mockAdminClient.single.mockResolvedValueOnce({ data: { id: 'new-id', email: 'ok@ex.com' }, error: null });

            const result = await service.criarUsuario({ email: 'ok@ex.com', nome_completo: 'New', role: 'admin' });
            expect(result.id).toBe('new-id');
        });
    });
});
