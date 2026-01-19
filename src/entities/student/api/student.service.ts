import { studentApi } from './student.api';
import { studentReportsApi } from './student-reports.api';

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

/** @deprecated Use studentReportsApi from @/entities/student */
export const StudentReportsAPI = studentReportsApi;

/** @deprecated Use studentReportsApi from @/entities/student */
export const BoletimAPI = {
  listar: studentReportsApi.listBoletins,
  visualizarPDF: studentReportsApi.visualizarBoletimPDF,
};

/** @deprecated Use studentReportsApi from @/entities/student */
export class BoletimService {
  static listar = studentReportsApi.listBoletins;
  static visualizarPDF = studentReportsApi.visualizarBoletimPDF;
}

/** @deprecated Use studentReportsApi from @/entities/student */
export class CertificadoService {
  static gerar = studentReportsApi.gerarCertificado;
  static validar = studentReportsApi.validarCertificado;
}
