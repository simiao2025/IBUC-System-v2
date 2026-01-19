/**
 * UtilitÃ¡rio de log centralizado para o IBUC System v2.
 * Permite gerenciar o nÃ­vel de log e desativar logs de debug em produÃ§Ã£o.
 */

// type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const IS_PROD = import.meta.env.PROD;

const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (!IS_PROD) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    console.info(`[INFO] ${message}`, ...args);
  },

  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, ...args);
    // Aqui vocÃª poderia integrar com Sentry ou outro serviÃ§o de monitoramento
  }
};

export default logger;
