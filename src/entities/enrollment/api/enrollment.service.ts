import { enrollmentApi } from './enrollment.api';

/** @deprecated Use enrollmentApi from @/entities/enrollment */
export const MatriculaAPI = {
  listar: enrollmentApi.list,
  buscarPorId: enrollmentApi.getById,
  criar: enrollmentApi.create,
  atualizar: enrollmentApi.update,
  deletar: enrollmentApi.delete,
  aprovar: enrollmentApi.approve,
  rejeitar: enrollmentApi.reject,
};

/** @deprecated Use enrollmentApi from @/entities/enrollment */
export const PreMatriculasAPI = {
  listar: enrollmentApi.listPreMatriculas,
  buscarPorId: enrollmentApi.getPreMatriculaById,
  criar: (data: any) => enrollmentApi.create(data), // Note: This might still be wrong if it should create a pre-matricula, but keeping as is for now if create endpoint is shared or unknown.
  atualizar: enrollmentApi.updatePreMatricula,
  atualizarStatus: enrollmentApi.updatePreMatriculaStatus,
  concluir: enrollmentApi.concludePreMatricula,
  deletar: enrollmentApi.deletePreMatricula,
  aprovar: enrollmentApi.approve,
  rejeitar: enrollmentApi.reject,
};

/** @deprecated Use enrollmentApi from @/entities/enrollment */
export const ListaEsperaAPI = {
  cadastrar: enrollmentApi.waitlistRegister,
  listar: enrollmentApi.waitlistList,
};

/** @deprecated Use enrollmentApi from @/entities/enrollment */
export class ListaEsperaService {
  static cadastrar = enrollmentApi.waitlistRegister;
  static listar = enrollmentApi.waitlistList;
}

/** @deprecated Use enrollmentApi from @/entities/enrollment */
export const MatriculaService = MatriculaAPI;
