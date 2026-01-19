import { systemConfigApi } from '@/entities/system';

/**
 * @deprecated Use systemConfigApi from @/entities/system instead.
 */
export const ConfiguracoesService = {
    listarTodas: systemConfigApi.listAll,
    buscarPorChave: systemConfigApi.getByKey,
    atualizar: systemConfigApi.update,
    buscarTodasComoObjeto: systemConfigApi.getSettingsAsObject,
    salvarLote: systemConfigApi.updateBatch
};
