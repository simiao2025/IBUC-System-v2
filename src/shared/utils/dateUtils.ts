/**
 * Utilitários para tratamento de datas no IBUC System.
 * Resolve problemas comuns de fuso horário (UTC vs Local) em componentes frontend.
 */

/**
 * Converte uma string de data (ISO ou similar) para um objeto Date ajustado para o meio-dia local.
 * Isso evita que a data "volte um dia" devido ao fuso horário de Brasília (UTC-3).
 * 
 * @param dateStr String de data vinda do backend (ex: "2026-03-31")
 */
export const parseISOToLocal = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date();

  // Remove qualquer parte de hora/fuso para tratar como data "pura" (YYYY-MM-DD)
  // Isso evita que "2026-03-31T00:00:00.000Z" vire "2026-03-30" em Brasília.
  const onlyDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];
  
  // Adicionamos T12:00:00 (meio-dia) para garantir que, ao converter para objeto Date,
  // mesmo com variações de fuso horário, ainda estejamos no dia correto.
  return new Date(`${onlyDate}T12:00:00`);
};

/**
 * Formata uma data para o padrão brasileiro (DD de Mês de AAAA).
 * 
 * @param date Objeto Date ou string de data
 * @param options Opções de formatação adicionais
 */
export const formatLocalDate = (
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  };

  // Faz merge das opções para garantir que o timeZone não seja perdido se o usuário 
  // passar apenas { day: '2-digit' }, por exemplo.
  const mergedOptions = { ...defaultOptions, ...options };

  const dateObj = typeof date === 'string' ? parseISOToLocal(date) : date;
  return dateObj.toLocaleDateString('pt-BR', mergedOptions);
};

/**
 * Retorna apenas o dia do mês.
 */
export const getLocalDay = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISOToLocal(date) : date;
  return dateObj.getDate().toString();
};

/**
 * Retorna o mês abreviado ou completo.
 */
export const getLocalMonth = (
  date: Date | string | null | undefined,
  format: 'short' | 'long' = 'short'
): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISOToLocal(date) : date;
  return dateObj.toLocaleDateString('pt-BR', { month: format }).replace('.', '');
};
