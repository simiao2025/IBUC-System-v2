export * from '@/entities/student/model/types';
export * from '@/entities/enrollment/model/types';
export * from '@/entities/polo/model/types';
export * from '@/entities/user/model/types';
export * from '@/entities/turma/model/types';

// Aliases para compatibilidade legada
export type { Nivel as Level } from '@/entities/turma/model/types';
export type { Polo as UiPolo } from '@/entities/polo/model/types';

// Re-exportar tipos do database
export * from './database';
