// Utility function to generate random password for students
export function gerarSenhaAleatoria(): string {
  return Math.random().toString(36).slice(-6).toUpperCase();
}

// Utility function to normalize CPF (remove formatting)
export function normalizarCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}
