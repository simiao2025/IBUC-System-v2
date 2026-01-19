import { api } from '@/shared/api';
import { 
  LoginCredentials, 
  StudentLoginCredentials, 
  PasswordRecoveryRequest, 
  PasswordRecoveryConfirm,
  AuthResponse
} from '../model/types';

export const authApi = {
  login: (data: LoginCredentials) => 
    api.post<AuthResponse>('/usuarios/login', data),

  loginStudent: (data: StudentLoginCredentials) => 
    api.post<AuthResponse>('/usuarios/login-aluno', data),

  requestPasswordRecovery: (data: PasswordRecoveryRequest) => 
    api.post<void>('/usuarios/recuperar-senha/solicitar-codigo', data),

  confirmPasswordRecovery: (data: PasswordRecoveryConfirm) => 
    api.post<void>('/usuarios/recuperar-senha/confirmar-codigo', data),
};
