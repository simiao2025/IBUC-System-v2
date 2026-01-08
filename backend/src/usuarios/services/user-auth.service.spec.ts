import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthService } from './user-auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserManagementService } from './user-management.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('UserAuthService', () => {
    let service: UserAuthService;
    let managementService: UserManagementService;
    let jwtService: JwtService;

    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        cpf: '12345678901',
        password_hash: '$2a$10$hashedpassword',
        role: 'aluno',
        ativo: true,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserAuthService,
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn().mockResolvedValue('mock-token'),
                    },
                },
                {
                    provide: UserManagementService,
                    useValue: {
                        buscarUsuarioPorEmail: jest.fn(),
                        buscarUsuarioPorCpf: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UserAuthService>(UserAuthService);
        managementService = module.get<UserManagementService>(UserManagementService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        it('should return token and user on successful login', async () => {
            jest.spyOn(managementService, 'buscarUsuarioPorEmail').mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

            const result = await service.login('test@example.com', 'password10chars');

            expect(result).toHaveProperty('token', 'mock-token');
            expect(result.user.email).toBe(mockUser.email);
            expect((result.user as any).password_hash).toBeUndefined();
        });

        it('should throw BadRequestException if user is inactive', async () => {
            jest.spyOn(managementService, 'buscarUsuarioPorEmail').mockResolvedValue({ ...mockUser, ativo: false });

            await expect(service.login('test@example.com', 'password')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if password mismatch', async () => {
            jest.spyOn(managementService, 'buscarUsuarioPorEmail').mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

            await expect(service.login('test@example.com', 'wrongpassword')).rejects.toThrow(BadRequestException);
        });
    });

    describe('loginPorCpf', () => {
        it('should login successfully with CPF', async () => {
            jest.spyOn(managementService, 'buscarUsuarioPorCpf').mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

            const result = await service.loginPorCpf('12345678901', 'password');

            expect(result).toHaveProperty('token', 'mock-token');
        });
    });
});
