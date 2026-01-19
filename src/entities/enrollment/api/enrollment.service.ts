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
  buscarPorId: enrollmentApi.getById,
  criar: (data: any) => enrollmentApi.create(data),
  deletar: enrollmentApi.delete,
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
