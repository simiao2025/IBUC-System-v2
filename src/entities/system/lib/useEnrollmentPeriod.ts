import { useState, useEffect } from 'react';
import { systemConfigApi } from '../api/system-config.api';

export function useEnrollmentPeriod() {
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

  useEffect(() => {
    async function checkPeriod() {
      try {
        const config = await systemConfigApi.getSettingsAsObject();
        if (config.periodo_matricula) {
          const now = new Date();
          const start = new Date(config.periodo_matricula.start);
          const end = new Date(config.periodo_matricula.end);

          const isOpen = now >= start && now <= end;
          setIsEnrollmentOpen(isOpen);
          setDates({
            start: config.periodo_matricula.start,
            end: config.periodo_matricula.end
          });
        }
      } catch (error) {
        console.error('Erro ao verificar período de matrícula:', error);
        // Fallback para aberto em caso de erro (comportamento original)
        setIsEnrollmentOpen(true);
      } finally {
        setLoading(false);
      }
    }

    checkPeriod();
  }, []);

  return { isEnrollmentOpen, loading, dates };
}
