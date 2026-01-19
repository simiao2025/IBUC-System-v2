import { StudentReportsAPI } from '@/entities/student';
import { AttendanceReportsAPI } from '@/entities/attendance';
import { FinanceReportsAPI } from '@/entities/finance';
import { PoloReportsAPI } from '@/entities/polo';
import { api } from '@/shared/api';

/**
 * @deprecated Use Entity-specific report APIs instead.
 */
export const RelatoriosAPI = {
  gerarBoletim: StudentReportsAPI.gerarBoletim,
  getDadosBoletim: StudentReportsAPI.getDadosBoletim,
  gerarBoletimLote: StudentReportsAPI.gerarBoletimLote,
  getJobStatus: StudentReportsAPI.getJobStatus,
  historicoAluno: StudentReportsAPI.historicoAluno,
  gerarHistoricoPdf: StudentReportsAPI.gerarHistoricoPdf,
  estatisticasPorPolo: PoloReportsAPI.estatisticasPorPolo,
  relatorioDracmas: FinanceReportsAPI.relatorioDracmas,
  relatorioListaAlunos: StudentReportsAPI.relatorioListaAlunos,
  gerarListaAlunosPdf: StudentReportsAPI.gerarListaAlunosPdf,
  relatorioAtestadoMatricula: StudentReportsAPI.relatorioAtestadoMatricula,
  relatorioListaChamada: AttendanceReportsAPI.relatorioListaChamada,
  relatorioConsolidadoFrequencia: AttendanceReportsAPI.relatorioConsolidadoFrequencia,
  relatorioInadimplencia: FinanceReportsAPI.relatorioInadimplencia,
  gerarCertificado: StudentReportsAPI.gerarCertificado,
};

export const LgpdAPI = {
  exportar: (type: string, id: string) => api.get(`/lgpd/export/${type}/${id}`),
  anonymizar: (type: string, id: string) => api.post(`/lgpd/anonymize/${type}/${id}`),
};

/**
 * @deprecated Use Entity-specific report APIs instead.
 */
export class RelatorioService {
  static gerarBoletim = StudentReportsAPI.gerarBoletim;
  static getDadosBoletim = StudentReportsAPI.getDadosBoletim;
  static gerarBoletimLote = StudentReportsAPI.gerarBoletimLote;
  static getJobStatus = StudentReportsAPI.getJobStatus;
  static historicoAluno = StudentReportsAPI.historicoAluno;
  static gerarHistoricoPdf = StudentReportsAPI.gerarHistoricoPdf;
  static estatisticasPorPolo = PoloReportsAPI.estatisticasPorPolo;
  static relatorioDracmas = FinanceReportsAPI.relatorioDracmas;
  static relatorioListaAlunos = StudentReportsAPI.relatorioListaAlunos;
  static gerarListaAlunosPdf = StudentReportsAPI.gerarListaAlunosPdf;
  static relatorioAtestadoMatricula = StudentReportsAPI.relatorioAtestadoMatricula;
  static relatorioListaChamada = AttendanceReportsAPI.relatorioListaChamada;
  static relatorioConsolidadoFrequencia = AttendanceReportsAPI.relatorioConsolidadoFrequencia;
  static relatorioInadimplencia = FinanceReportsAPI.relatorioInadimplencia;
  static gerarCertificado = StudentReportsAPI.gerarCertificado;
}

export class LgpdService {
  static exportar = LgpdAPI.exportar;
  static anonymizar = LgpdAPI.anonymizar;
}
