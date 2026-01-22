// ============================================
// IBUC System - Tipos do Banco de Dados
// Tipos baseados no schema Supabase/PostgreSQL
// ============================================

// Enums
export type StatusPolo = 'ativo' | 'inativo';
export type RoleUsuario =
  | 'super_admin'
  | 'admin_geral'
  | 'diretor_geral'
  | 'coordenador_geral'
  | 'diretor_polo'
  | 'coordenador_polo'
  | 'secretario_polo'
  | 'tesoureiro'
  | 'professor'
  | 'auxiliar'
  | 'responsavel'
  | 'aluno';

export type StatusAluno = 'pendente' | 'ativo' | 'inativo' | 'concluido';
export type Sexo = 'M' | 'F';
export type TipoParentesco = 'pai' | 'mae' | 'tutor' | 'outro';
export type Turno = 'manha' | 'tarde' | 'noite';
export type StatusTurma = 'ativa' | 'inativa' | 'concluida';
export type StatusMatricula = 'pendente' | 'em_analise' | 'ativa' | 'recusada' | 'cancelada';
export type TipoMatricula = 'online' | 'presencial';
export type StatusPreMatricula = 'em_analise' | 'ativo' | 'trancado' | 'concluido';
export type StatusPresenca = 'presente' | 'falta' | 'justificativa' | 'atraso';
export type TipoConteudo = 'pdf' | 'video' | 'atividade' | 'link';
export type StatusMensalidade = 'pendente' | 'pago' | 'vencido';
export type MetodoPagamento = 'pix' | 'boleto' | 'cartao' | 'presencial';
export type StatusPagamento = 'pending' | 'success' | 'failed';
export type TipoNotificacao = 'sistema' | 'aviso_polo' | 'aviso_turma';
export type TipoConsentimento = 'uso_imagem' | 'tratamento_dados' | 'comunicacao' | 'outros';
export type TipoDocumento = 'certidao' | 'rg' | 'cpf' | 'comprovante_residencia' | 'laudo' | 'foto' | 'outro';
export type OwnerType = 'aluno' | 'responsavel' | 'usuario';

// Interfaces de Endereço
export interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// 2.1 PRÉ-MATRICULAS
export interface PreMatricula {
  id: string;
  nome_completo: string;
  cpf: string;
  rg?: string;
  rg_orgao?: string;
  rg_data_expedicao?: string;
  data_nascimento: string;
  sexo: Sexo;
  naturalidade?: string;
  nacionalidade?: string;
  email_responsavel: string;
  telefone_responsavel: string;
  nome_responsavel?: string;
  cpf_responsavel?: string;
  tipo_parentesco?: TipoParentesco;
  endereco: Endereco;
  // Explicit Health Fields
  alergias?: string;
  restricao_alimentar?: string;
  medicacao_continua?: string;
  doencas_cronicas?: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  convenio_medico?: string;
  hospital_preferencia?: string;
  autorizacao_medica?: boolean;
  // Second Guardian
  nome_responsavel_2?: string;
  cpf_responsavel_2?: string;
  telefone_responsavel_2?: string;
  email_responsavel_2?: string;
  tipo_parentesco_2?: string;
  saude?: any;
  responsaveis?: any[];
  polo_id: string;
  nivel_id?: string;
  escola_origem?: string;
  ano_escolar?: string;
  observacoes?: string;
  status: StatusPreMatricula;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// 1. POLOS
export interface Polo {
  id: string;
  nome: string;
  codigo: string;
  cnpj?: string;
  endereco: Endereco;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  site?: string;
  horarios_funcionamento?: Record<string, any>;
  capacidade_maxima?: number;
  logo_url?: string;
  diretor_id?: string;
  pastor_responsavel: string;
  status: StatusPolo;
  created_at: string;
  updated_at: string;
}

// 2. USUARIOS
export interface Usuario {
  id: string;
  email: string;
  password_hash?: string;
  nome_completo: string;
  cpf?: string;
  telefone?: string;
  role: RoleUsuario;
  polo_id?: string;
  ativo: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// 3. NIVELS
export interface Nivel {
  id: string;
  nome: string;
  idade_min: number;
  idade_max: number;
  descricao?: string;
  ordem: number;
  created_at: string;
}

// 4. MODULOS
export interface Modulo {
  id: string;
  numero: number;
  titulo: string;
  descricao?: string;
  duracao_sugestiva?: number;
  requisitos?: string;
  objetivos?: string;
  carga_horaria?: number;
  created_at: string;
}

// 5. TURMAS
export interface Turma {
  id: string;
  nome: string;
  polo_id: string;
  nivel_id: string;
  modulo_atual_id?: string;
  professor_id?: string;
  coordenador_id?: string;
  capacidade: number;
  ano_letivo: number;
  turno: Turno;
  dias_semana: number[];
  horario_inicio?: string;
  horario_fim?: string;
  local?: string;
  status: StatusTurma;
  data_inicio?: string;
  data_previsao_termino?: string;
  data_conclusao?: string;
  migracao_concluida: boolean;
  created_at: string;
}

// 6. RESPONSAVEIS
export interface Responsavel {
  id: string;
  nome: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string;
  telefone1: string;
  telefone2?: string;
  email?: string;
  endereco?: Endereco;
  tipo_parentesco: TipoParentesco;
  usuario_id?: string;
  created_at: string;
  updated_at: string;
}

// 7. ALUNOS
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
  // Dados de saÃºde
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
  saude?: any; // Para compatibilidade com fluxos JSONB
  // Dados escolares
  escola_atual?: string;
  serie?: string;
  dificuldades_aprendizagem?: boolean;
  descricao_dificuldades?: string;
  // ResponsÃ¡veis
  nome_responsavel_2?: string;
  cpf_responsavel_2?: string;
  telefone_responsavel_2?: string;
  email_responsavel_2?: string;
  tipo_parentesco_2?: string;
  responsaveis?: any[]; // Array de responsÃ¡veis unificado
  data_criacao: string;
  data_atualizacao: string;
}

// 8. ALUNO_RESPONSAVEL
export interface AlunoResponsavel {
  id: string;
  aluno_id: string;
  responsavel_id: string;
  autorizado_retirada: boolean;
  observacao?: string;
  created_at: string;
}

// 9. MATRICULAS
export interface Matricula {
  id: string;
  aluno_id: string;
  turma_id?: string;
  polo_id: string;
  data_matricula: string;
  tipo: TipoMatricula;
  status: StatusMatricula;
  origem?: string;
  protocolo: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  motivo_recusa?: string;
  created_at: string;
}

// 10. LICOES
export interface Licao {
  id: string;
  modulo_id: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  video_url?: string;
  material_pdf_url?: string;
  liberacao_data?: string;
  duracao_minutos?: number;
  created_at: string;
}

// 11. CONTEUDOS
export interface Conteudo {
  id: string;
  licao_id: string;
  tipo: TipoConteudo;
  titulo: string;
  descricao?: string;
  url?: string;
  anexos?: Record<string, any>;
  created_at: string;
}

// 12. PRESENCAS
export interface Presenca {
  id: string;
  aluno_id: string;
  turma_id: string;
  data: string;
  status: StatusPresenca;
  lancado_por: string;
  observacao?: string;
  created_at: string;
}

// 13. AVALIACOES
export interface Avaliacao {
  id: string;
  turma_id: string;
  modulo_id?: string;
  titulo: string;
  descricao?: string;
  data_avaliacao: string;
  peso: number;
  created_at: string;
}

// 14. NOTAS
export interface Nota {
  id: string;
  avaliacao_id: string;
  aluno_id: string;
  nota: number;
  comentario?: string;
  lancado_por: string;
  created_at: string;
}

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

// 16. DOCUMENTOS
export interface Documento {
  id: string;
  owner_type: OwnerType;
  owner_id: string;
  tipo_documento: TipoDocumento;
  url: string;
  file_name: string;
  validade?: string;
  uploaded_by?: string;
  uploaded_at: string;
  validado: boolean;
  validado_por?: string;
  validado_em?: string;
}

// 17. MENSALIDADES
export interface Mensalidade {
  id: string;
  aluno_id: string;
  polo_id: string;
  titulo: string; // Ex: "MÃ³dulo 1", "Taxa de MatrÃ­cula"
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

// 19. NOTIFICACOES
export interface Notificacao {
  id: string;
  title: string;
  body: string;
  tipo: TipoNotificacao;
  target_id?: string;
  enviado: boolean;
  sent_at?: string;
  created_at: string;
}

// 20. CONSENTS (LGPD)
export interface Consent {
  id: string;
  subject_type: OwnerType;
  subject_id: string;
  consent_type: TipoConsentimento;
  version: string;
  accepted_at: string;
  accepted_ip?: string;
  accepted_user_agent?: string;
  revoked_at?: string;
}

// 21. AUDIT_LOGS
export interface AuditLog {
  id: string;
  entity: string;
  entity_id: string;
  action: string;
  payload?: Record<string, any>;
  user_id?: string;
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


export type TipoCertificado = 'modulo' | 'curso_completo' | 'participacao';

export interface Certificado {
  id: string;
  aluno_id: string;
  modulo_id?: string;
  turma_id?: string;
  tipo: TipoCertificado;
  data_emissao: string;
  codigo_validacao: string;
  url_arquivo?: string;
  emitido_por: string;
  created_at: string;
  aluno?: { nome: string };
  modulo?: { titulo: string };
  turma?: { nome: string };
}

// 22. EVENTOS
export interface Evento {
  id: string;
  titulo: string;
  descricao?: string;
  local?: string;
  data_inicio: string;
  data_fim?: string;
  polo_id?: string;
  criado_por?: string;
  created_at: string;
  updated_at: string;
}
