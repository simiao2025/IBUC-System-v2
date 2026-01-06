import { z } from 'zod';

// Helper para validar CPF (formato básico)
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
// Helper para validar CEP
const cepRegex = /^\d{5}-\d{3}$/;
// Helper para validar telefone
const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;

export const saudeSchema = z.object({
  alergias: z.string().min(1, 'Informe as alergias ou "Nenhuma"'),
  restricao_alimentar: z.string().optional(),
  medicacao_continua: z.string().min(1, 'Informe a medicação ou "Nenhuma"'),
  doencas_cronicas: z.string().optional(),
  contato_emergencia_nome: z.string().min(1, 'Nome de emergência obrigatório'),
  contato_emergencia_telefone: z.string().min(1, 'Telefone de emergência obrigatório'),
  convenio_medico: z.string().optional(),
  hospital_preferencia: z.string().optional(),
  autorizacao_medica: z.boolean().default(false),
});

export const preMatriculaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  data_nascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  sexo: z.enum(['M', 'F'], {
    errorMap: () => ({ message: 'Selecione o sexo' }),
  }),
  cpf: z.string().regex(cpfRegex, 'CPF inválido (000.000.000-00)'),
  rg_orgao: z.string().optional(),
  rg_data_expedicao: z.string().optional(),
  naturalidade: z.string().optional(),
  nacionalidade: z.string().default('Brasileira'),
  
  // Endereço
  cep: z.string().regex(cepRegex, 'CEP inválido (00000-000)'),
  rua: z.string().min(1, 'Rua é obrigatória'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 letras'),
  
  // Responsável
  nome_responsavel: z.string().min(3, 'Nome do responsável é obrigatório'),
  tipo_parentesco: z.enum(['pai', 'mae', 'tutor', 'outro'], {
    errorMap: () => ({ message: 'Selecione o parentesco' }),
  }),
  cpf_responsavel: z.string().regex(cpfRegex, 'CPF do responsável inválido').optional().or(z.literal('')),
  telefone_responsavel: z.string().regex(phoneRegex, 'Telefone inválido ((00) 00000-0000)'),
  email_responsavel: z.string().email('E-mail inválido'),
  
  // Responsável 2 (opcional)
  nome_responsavel_2: z.string().optional(),
  cpf_responsavel_2: z.string().optional(),
  telefone_responsavel_2: z.string().optional(),
  email_responsavel_2: z.string().email('E-mail inválido').optional().or(z.literal('')),
  tipo_parentesco_2: z.string().optional(),
  
  // Saúde
  saude: saudeSchema,
  
  // Matrícula
  polo_id: z.string().min(1, 'Selecione um polo'),
  nivel_id: z.string().min(1, 'Selecione um nível'),
  turma_id: z.string().optional(),
  escola_origem: z.string().optional(),
  ano_escolar: z.string().optional(),
  observacoes: z.string().optional(),
  aceite_termo: z.boolean().refine(val => val === true, 'Você deve aceitar os termos'),
});

export type PreMatriculaInput = z.infer<typeof preMatriculaSchema>;
