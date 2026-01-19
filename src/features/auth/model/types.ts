export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StudentLoginCredentials {
  cpf: string;
  password: string;
}

export interface PasswordRecoveryRequest {
  email: string;
}

export interface PasswordRecoveryConfirm {
  email: string;
  codigo: string;
  senhaNova: string;
}

export interface AuthResponse {
  user: any; // Will be refined as we move more types
  token: string;
}
