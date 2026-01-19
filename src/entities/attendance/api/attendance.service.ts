import { attendanceApi } from './attendance.api';
import { attendanceReportsApi } from './attendance-reports.api';

/** @deprecated Use attendanceApi from @/entities/attendance */
export const PresencaService = {
  listarPorAluno: attendanceApi.listByStudent,
  listarPorTurma: attendanceApi.listByClass,
  listarAulasLancadas: attendanceApi.listAulasLancadas,
  lancarPresencas: attendanceApi.submitBatch,
  removerAula: attendanceApi.deleteBatch,
  deletar: attendanceApi.delete,
};

/** @deprecated Use attendanceReportsApi from @/entities/attendance */
export const AttendanceReportsAPI = {
  relatorioListaChamada: attendanceReportsApi.relatorioListaChamada,
  relatorioConsolidadoFrequencia: attendanceReportsApi.relatorioConsolidadoFrequencia,
};
