import { Test, TestingModule } from '@nestjs/testing';
import { UserPasswordService } from './user-password.service';
import { UserManagementService } from './user-management.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { NotificacoesService } from '../../notificacoes/notificacoes.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('UserPasswordService', () => {
    let service: UserPasswordService;
    let managementService: UserManagementService;
    let supabase: SupabaseService;
    let notifications: NotificacoesService;

    const mockAdminClient = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn(),
        single: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserPasswordService,
                {
                    provide: UserManagementService,
                    useValue: {
                        buscarUsuarioPorEmail: jest.fn(),
                        atualizarUsuario: jest.fn(),
                    },
                },
                {
                    provide: SupabaseService,
                    useValue: {
                        getAdminClient: () => mockAdminClient,
                    },
                },
                {
                    provide: NotificacoesService,
                    useValue: {
                        enviarCodigoRecuperacaoSenha: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UserPasswordService>(UserPasswordService);
        managementService = module.get<UserManagementService>(UserManagementService);
        supabase = module.get<SupabaseService>(SupabaseService);
        notifications = module.get<NotificacoesService>(NotificacoesService);
    });

    describe('alterarSenha', () => {
        it('should change password successfully', async () => {
            const mockUser = { id: 'u1', email: 't@e.com', password_hash: 'old', ativo: true };
            jest.spyOn(managementService, 'buscarUsuarioPorEmail').mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hash' as never);
            mockAdminClient.single.mockResolvedValue({ data: {}, error: null });

            const result = await service.alterarSenha('t@e.com', 'old', 'new-password-10');

            expect(result.message).toBe('Senha alterada com sucesso');
            expect(mockAdminClient.from).toHaveBeenCalledWith('usuarios');
        });

        it('should throw BadRequestException if current password wrong', async () => {
            jest.spyOn(managementService, 'buscarUsuarioPorEmail').mockResolvedValue({ id: 'u1', password_hash: 'h', ativo: true } as any);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

            await expect(service.alterarSenha('t@e.com', 'wrong', 'new'))
                .rejects.toThrow(BadRequestException);
        });
    });
});
