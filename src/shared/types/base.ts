// ============================================
// IBUC System - Shared Base Types
// ============================================

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
export type StatusMatricula = 'pendente' | 'em_analise' | 'ativa' | 'recusada' | 'cancelada' | 'concluida';
export type TipoMatricula = 'online' | 'presencial';
export type StatusPreMatricula = 'em_analise' | 'ativo' | 'trancado' | 'concluido' | 'pendente';
export type StatusPresenca = 'presente' | 'falta' | 'justificativa' | 'atraso';
export type TipoConteudo = 'pdf' | 'video' | 'atividade' | 'link';
export type StatusMensalidade = 'pendente' | 'pago' | 'vencido';
export type MetodoPagamento = 'pix' | 'boleto' | 'cartao' | 'presencial';
export type StatusPagamento = 'pending' | 'success' | 'failed';
export type TipoNotificacao = 'sistema' | 'aviso_polo' | 'aviso_turma';
export type TipoConsentimento = 'uso_imagem' | 'tratamento_dados' | 'comunicacao' | 'outros';
export type TipoDocumento = 'certidao' | 'rg' | 'cpf' | 'comprovante_residencia' | 'laudo' | 'foto' | 'outro';
export type OwnerType = 'aluno' | 'responsavel' | 'usuario';

export interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}
