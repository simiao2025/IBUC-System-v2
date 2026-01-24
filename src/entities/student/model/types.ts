import { 
  Endereco, 
  Sexo, 
  StatusAluno, 
  StatusMensalidade, 
  MetodoPagamento, 
  StatusPagamento 
} from '@/shared/types';

export type { StatusAluno } from '@/shared/types';

export interface Aluno {
  id: string;
  usuario_id?: string;
  nome: string;
  data_nascimento: string;
  sexo: Sexo;
  nacionalidade?: string;
  naturalidade?: string;
  cpf?: string;
  rg?: string;
  rg_orgao?: string;
  rg_data_expedicao?: string;
  certidao_numero?: string;
  endereco: Endereco;
  foto_url?: string;
  polo_id: string;
  turma_id?: string;
  nivel_atual_id: string;
  status: StatusAluno;
  observacoes?: string;
  // Dados de saúde unificados
  alergias?: string;
  restricao_alimentar?: string;
  medicacao_continua?: string;
  doencas_cronicas?: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  convenio_medico?: string;
  hospital_preferencia?: string;
  autorizacao_medica?: boolean;
  observacoes_medicas?: string;
  // Dados escolares
  escola_atual?: string;
  serie?: string;
  dificuldades_aprendizagem?: boolean;
  descricao_dificuldades?: string;
  // Responsáveis (Camada 1 e 2)
  nome_responsavel?: string;
  cpf_responsavel?: string;
  telefone_responsavel?: string;
  email_responsavel?: string;
  tipo_parentesco?: string;
  nome_responsavel_2?: string;
  cpf_responsavel_2?: string;
  telefone_responsavel_2?: string;
  email_responsavel_2?: string;
  tipo_parentesco_2?: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface AlunoFiltros {
  polo_id?: string;
  status?: string;
  search?: string;
  turma_id?: string;
}

export type AlunoCreateDto = Omit<Aluno, 'id' | 'data_criacao' | 'data_atualizacao'>;
export type AlunoUpdateDto = Partial<Aluno>;

// 15. BOLETINS
export interface Boletim {
  id: string;
  aluno_id: string;
  periodo: string;
  nota_final?: number;
  situacao?: string;
  observacoes?: string;
  gerado_por?: string;
  generated_at: string;
  pdf_url?: string;
}

// 17. MENSALIDADES
export interface Mensalidade {
  id: string;
  aluno_id: string;
  polo_id: string;
  titulo: string;
  valor_cents: number;
  vencimento: string;
  status: StatusMensalidade;
  desconto_cents: number;
  juros_cents: number;
  created_at: string;
  pago_em?: string;
  comprovante_url?: string;
}

// 18. PAGAMENTOS
export interface Pagamento {
  id: string;
  mensalidade_id: string;
  metodo: MetodoPagamento;
  transacao_id_gateway?: string;
  valor_cents: number;
  status_gateway: StatusPagamento;
  recebido_por?: string;
  data_recebimento: string;
  comprovante_url?: string;
  created_at: string;
}

// Views
export interface AlunoProgresso {
  aluno_id: string;
  aluno_nome: string;
  polo_id: string;
  modulo_id: string;
  modulo_numero: number;
  modulo_titulo: string;
  total_licoes: number;
  licoes_concluidas: number;
  percentual_conclusao: number;
}

export interface ResumoFinanceiroAluno {
  aluno_id: string;
  aluno_nome: string;
  polo_id: string;
  total_mensalidades: number;
  mensalidades_pagas: number;
  mensalidades_pendentes: number;
  mensalidades_vencidas: number;
  total_devido_cents: number;
  total_pago_cents: number;
  total_pendente_cents: number;
}

// Compatibilidade Legada (Frontend Types)
export interface Student {
  id: string;
  name: string;
  name_social?: string;
  birthDate: string;
  cpf: string;
  rg?: string;
  gender: 'male' | 'female' | 'other';
  naturalidade?: string;
  nacionalidade?: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  phone: string;
  email: string;
  alergias?: string;
  medicamentos?: string;
  doencas_cronicas?: string;
  plano_saude?: string;
  hospital_preferencia?: string;
  autorizacao_medica?: boolean;
  escola_origem?: string;
  ano_escolar?: string;
  status: 'active' | 'inactive' | 'pending';
  registrationDate: string;
}

export interface Parent {
  fatherName: string;
  motherName: string;
  phone: string;
  email: string;
  fatherCpf: string;
  motherCpf: string;
}

export interface StudentData extends Student {
  parents: Parent;
}
