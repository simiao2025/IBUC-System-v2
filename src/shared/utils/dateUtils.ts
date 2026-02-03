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

  // Se já contém 'T', assumimos que é um ISO completo.
  // Se não contém, adicionamos 'T12:00:00' para garantir que, ao converter para local,
  // mesmo com deslocamento de -3h ou -4h, ainda estejamos no dia correto.
  const normalizedStr = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
  return new Date(normalizedStr);
};

/**
 * Formata uma data para o padrão brasileiro (DD de Mês de AAAA).
 * 
 * @param date Objeto Date ou string de data
 * @param options Opções de formatação adicionais
 */
export const formatLocalDate = (
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' }
): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISOToLocal(date) : date;
  return dateObj.toLocaleDateString('pt-BR', options);
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
