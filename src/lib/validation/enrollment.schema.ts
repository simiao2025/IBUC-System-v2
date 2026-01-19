import { z } from 'zod';

// Helper para validar CPF (formato bÃ¡sico)
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
// Helper para validar CEP
const cepRegex = /^\d{5}-\d{3}$/;
// Helper para validar telefone
const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;

export const saudeSchema = z.object({
  alergias: z.string().min(1, 'Informe as alergias ou "Nenhuma"'),
  restricao_alimentar: z.string().optional(),
  medicacao_continua: z.string().min(1, 'Informe a medicaÃ§Ã£o ou "Nenhuma"'),
  doencas_cronicas: z.string().optional(),
  contato_emergencia_nome: z.string().min(1, 'Nome de emergÃªncia obrigatÃ³rio'),
  contato_emergencia_telefone: z.string().min(1, 'Telefone de emergÃªncia obrigatÃ³rio'),
  convenio_medico: z.string().optional(),
  hospital_preferencia: z.string().optional(),
  autorizacao_medica: z.boolean().default(false),
});

export const preMatriculaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  data_nascimento: z.string().min(1, 'Data de nascimento Ã© obrigatÃ³ria'),
  sexo: z.enum(['M', 'F'], {
    errorMap: () => ({ message: 'Selecione o sexo' }),
  }),
  cpf: z.string().regex(cpfRegex, 'CPF invÃ¡lido (000.000.000-00)'),
  rg_orgao: z.string().optional(),
  rg_data_expedicao: z.string().optional(),
  naturalidade: z.string().optional(),
  nacionalidade: z.string().default('Brasileira'),
  
  // EndereÃ§o
  cep: z.string().regex(cepRegex, 'CEP invÃ¡lido (00000-000)'),
  rua: z.string().min(1, 'Rua Ã© obrigatÃ³ria'),
  numero: z.string().min(1, 'NÃºmero Ã© obrigatÃ³rio'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro Ã© obrigatÃ³rio'),
  cidade: z.string().min(1, 'Cidade Ã© obrigatÃ³ria'),
  estado: z.string().length(2, 'Estado deve ter 2 letras'),
  
  // ResponsÃ¡vel
  nome_responsavel: z.string().min(3, 'Nome do responsÃ¡vel Ã© obrigatÃ³rio'),
  tipo_parentesco: z.enum(['pai', 'mae', 'tutor', 'outro'], {
    errorMap: () => ({ message: 'Selecione o parentesco' }),
  }),
  cpf_responsavel: z.string().regex(cpfRegex, 'CPF do responsÃ¡vel invÃ¡lido').optional().or(z.literal('')),
  telefone_responsavel: z.string().regex(phoneRegex, 'Telefone invÃ¡lido ((00) 00000-0000)'),
  email_responsavel: z.string().email('E-mail invÃ¡lido'),
  
  // ResponsÃ¡vel 2 (opcional)
  nome_responsavel_2: z.string().optional(),
  cpf_responsavel_2: z.string().optional(),
  telefone_responsavel_2: z.string().optional(),
  email_responsavel_2: z.string().email('E-mail invÃ¡lido').optional().or(z.literal('')),
  tipo_parentesco_2: z.string().optional(),
  
  // SaÃºde
  saude: saudeSchema,
  
  // MatrÃ­cula
  polo_id: z.string().min(1, 'Selecione um polo'),
  nivel_id: z.string().min(1, 'Selecione um nÃ­vel'),
  turma_id: z.string().optional(),
  escola_origem: z.string().optional(),
  ano_escolar: z.string().optional(),
  observacoes: z.string().optional(),
  aceite_termo: z.boolean().refine(val => val === true, 'VocÃª deve aceitar os termos'),
});

export type PreMatriculaInput = z.infer<typeof preMatriculaSchema>;
