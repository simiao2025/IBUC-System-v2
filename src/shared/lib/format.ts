/**
 * Utilitários de formatação para o projeto IBUC System
 */

/**
 * Formata uma string de CPF (000.000.000-00)
 */
export const formatCPF = (cpf: string): string => {
  return cpf
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);
};

/**
 * Formata uma string de CEP (00000-000)
 */
export const formatCEP = (cep: string): string => {
  return cep
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 9);
};

/**
 * Formata uma string de Telefone (00) 00000-0000 ou (00) 0000-0000
 */
export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
      .substring(0, 14);
  }
  return digits
    .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    .substring(0, 15);
};

/**
 * Formata um valor numérico para moeda brasileira (R$)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
