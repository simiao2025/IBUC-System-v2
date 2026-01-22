import { attendanceApi } from './attendance.api';


/** @deprecated Use attendanceApi from @/entities/attendance */
export const PresencaService = {
  listarPorAluno: attendanceApi.listByStudent,
  listarPorTurma: attendanceApi.listByClass,
  listarAulasLancadas: attendanceApi.listAulasLancadas,
  lancarPresencas: attendanceApi.submitBatch,
  removerAula: attendanceApi.deleteBatch,
  deletar: attendanceApi.delete,
};


