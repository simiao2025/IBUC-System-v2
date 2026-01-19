import type { TipoDocumento, StatusPreMatricula } from '../types/database';

/**
 * Documentos obrigatÃ³rios para o processo de prÃ©-matrÃ­cula e matrÃ­cula
 */
export const REQUIRED_DOCUMENTS: { value: TipoDocumento; label: string }[] = [
  { value: 'rg', label: 'Documento de Identidade (RG)' },
  { value: 'certidao', label: 'CertidÃ£o de Nascimento' },
  { value: 'comprovante_residencia', label: 'Comprovante de ResidÃªncia' },
  { value: 'foto', label: 'Foto 3x4' },
];

/**
 * OpÃ§Ãµes de status para prÃ©-matrÃ­cula
 */
export const PRE_MATRICULA_STATUS_OPTIONS: Array<{ value: StatusPreMatricula; label: string }> = [
  { value: 'em_analise', label: 'Em anÃ¡lise' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'trancado', label: 'Trancado' },
  { value: 'concluido', label: 'ConcluÃ­do' },
];

/**
 * OpÃ§Ãµes de gÃªnero (comum em formulÃ¡rios)
 */
export const GENDER_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
];

/**
 * OpÃ§Ãµes de estados (comum em formulÃ¡rios)
 */
export const STATE_OPTIONS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'AmapÃ¡' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'CearÃ¡' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'EspÃ­rito Santo' },
  { value: 'GO', label: 'GoiÃ¡s' },
  { value: 'MA', label: 'MaranhÃ£o' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'ParÃ¡' },
  { value: 'PB', label: 'ParaÃ­ba' },
  { value: 'PR', label: 'ParanÃ¡' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'PiauÃ­' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'RondÃ´nia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'SÃ£o Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];
