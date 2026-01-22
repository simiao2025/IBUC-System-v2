export * from './model/types';
export * from './model/hooks';
export { turmaApi, moduleApi, lessonApi } from './api/turma.api';
export * from './api/turma.service';

// Named exports for backward compatibility
export { turmaApi as TurmasAPI } from './api/turma.api';
export { moduleApi as ModulosAPI } from './api/turma.api';

// Alias for Niveis API (part of turma API)
import { turmaApi } from './api/turma.api';
export const NiveisAPI = {
  listar: () => turmaApi.listNiveis(),
};
