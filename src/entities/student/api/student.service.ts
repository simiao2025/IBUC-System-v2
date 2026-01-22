import { studentApi } from './student.api';
import { StudentReportsAPI as StudentReportsApiSource } from './student-reports.api';

/** @deprecated Use studentApi from @/entities/student */
export const AlunosAPI = {
  listar: studentApi.list,
  buscarPorId: studentApi.getById,
  criar: studentApi.create,
  atualizar: studentApi.update,
  deletar: studentApi.delete,
  buscarHistorico: studentApi.getHistory,
};

/** @deprecated Use studentApi from @/entities/student */
export const AlunoService = {
  buscarHistoricoModulos: studentApi.getHistory,
  buscarPorId: studentApi.getById,
  atualizar: studentApi.update,
};

/** @deprecated Use StudentReportsAPI from @/entities/student */
export const StudentReportsAPI = StudentReportsApiSource;

/** @deprecated Use StudentReportsAPI from @/entities/student */
export const BoletimAPI = {
  listar: StudentReportsAPI.listBoletins,
  visualizarPDF: StudentReportsAPI.visualizarBoletimPDF,
};

/** @deprecated Use StudentReportsAPI from @/entities/student */
export class BoletimService {
  static listar = StudentReportsAPI.listBoletins;
  static visualizarPDF = StudentReportsAPI.visualizarBoletimPDF;
}

/** @deprecated Use StudentReportsAPI from @/entities/student */
export class CertificadoService {
  static gerar = StudentReportsAPI.gerarCertificado;
  static validar = StudentReportsAPI.validarCertificado;
}

/** @deprecated Use StudentReportsAPI from @/entities/student */
export const CertificadoAPI = {
  listar: StudentReportsAPI.listCertificados,
  gerar: StudentReportsAPI.gerarCertificado,
};
