import { attendanceApi } from '@/entities/attendance';

/**
 * @deprecated Use attendanceApi from @/entities/attendance instead.
 */
export const PresencasAPI = {
  lancarLote: attendanceApi.submitBatch,
  porAluno: attendanceApi.listByStudent,
  porTurma: attendanceApi.listByClass,
  aulasLancadas: attendanceApi.listAulasLancadas,
  excluirLote: attendanceApi.deleteBatch,
  excluir: attendanceApi.delete,
};

/**
 * @deprecated Use attendanceApi from @/entities/attendance instead.
 */
export class PresencaService {
  static lancarLote = attendanceApi.submitBatch;
  static porAluno = attendanceApi.listByStudent;
  static porTurma = attendanceApi.listByClass;
}
