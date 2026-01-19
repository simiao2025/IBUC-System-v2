export type Level = 'NIVEL_I' | 'NIVEL_II' | 'NIVEL_III' | 'NIVEL_IV';

export const LEVELS = {
  NIVEL_I: 'NÃ VEL I - 2 a 5 anos',
  NIVEL_II: 'NÃ VEL II - 6 a 8 anos',
  NIVEL_III: 'NÃ VEL III - 9 a 11 anos',
  NIVEL_IV: 'NÃ VEL IV - 12 a 16 anos',
} as const;

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  level: Level;
  polo: string;
  enrollmentDate: string;
  observations?: string;
}
