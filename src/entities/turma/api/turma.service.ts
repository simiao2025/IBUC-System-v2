import { turmaApi, moduleApi, lessonApi } from './turma.api';

/** @deprecated Use turmaApi from @/entities/turma */
export const TurmasAPI = {
  listar: turmaApi.list,
  buscarPorId: turmaApi.getById,
  criar: turmaApi.create,
  atualizar: turmaApi.update,
  deletar: turmaApi.delete,
  listarNiveis: turmaApi.listNiveis,
  getOccupancy: turmaApi.getOccupancy,
  previewTransition: turmaApi.previewTransition,
  closeModule: turmaApi.closeModule,
  trazerAlunos: turmaApi.trazerAlunos,
};

/** @deprecated Use moduleApi from @/entities/turma */
export const ModulosAPI = {
  listar: moduleApi.list,
  buscarPorId: moduleApi.getById,
  criar: moduleApi.create,
  atualizar: moduleApi.update,
  deletar: moduleApi.delete,
};

/** @deprecated Use lessonApi from @/entities/turma */
export const LicoesAPI = {
  listar: lessonApi.list,
  buscarPorId: lessonApi.getById,
  criar: lessonApi.create,
  atualizar: lessonApi.update,
  deletar: lessonApi.delete,
};
