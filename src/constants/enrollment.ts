import type { TipoDocumento, StatusPreMatricula } from '../types/database';

/**
 * Documentos obrigatórios para o processo de pré-matrícula e matrícula
 */
export const REQUIRED_DOCUMENTS: { value: TipoDocumento; label: string }[] = [
  { value: 'rg', label: 'Documento de Identidade (RG)' },
  { value: 'certidao', label: 'Certidão de Nascimento' },
  { value: 'comprovante_residencia', label: 'Comprovante de Residência' },
  { value: 'foto', label: 'Foto 3x4' },
];

/**
 * Opções de status para pré-matrícula
 */
export const PRE_MATRICULA_STATUS_OPTIONS: Array<{ value: StatusPreMatricula; label: string }> = [
  { value: 'em_analise', label: 'Em análise' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'trancado', label: 'Trancado' },
  { value: 'concluido', label: 'Concluído' },
];

/**
 * Opções de gênero (comum em formulários)
 */
export const GENDER_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
];

/**
 * Opções de estados (comum em formulários)
 */
export const STATE_OPTIONS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];
