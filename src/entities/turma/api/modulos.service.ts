import { moduleApi, lessonApi } from '@/entities/turma';

/**
 * @deprecated Use moduleApi from @/entities/turma instead.
 */
export const ModulosAPI = {
  listar: moduleApi.list,
  buscarPorId: moduleApi.getById,
  criar: moduleApi.create,
  atualizar: moduleApi.update,
  deletar: moduleApi.delete,
};

/**
 * @deprecated Use lessonApi from @/entities/turma instead.
 */
export const LicoesAPI = {
  listar: lessonApi.list,
  buscarPorId: lessonApi.getById,
  criar: lessonApi.create,
  atualizar: lessonApi.update,
  deletar: lessonApi.delete,
};
