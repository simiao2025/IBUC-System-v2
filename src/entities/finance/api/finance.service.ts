import { dracmasApi } from './dracmas.api';
import { financeApi } from './finance.api';
import { financeReportsApi } from './finance-reports.api';

/** @deprecated Use dracmasApi from @/entities/finance */
export const DracmasAPI = {
    porAluno: dracmasApi.listByStudent,
    porTurma: dracmasApi.listByClass,
    lancarLote: dracmasApi.submitBatch,
    removerLote: dracmasApi.deleteBatch,
    removerLoteAluno: dracmasApi.deleteStudentBatch,
    saldo: dracmasApi.getSaldo,
    total: dracmasApi.getTotal,
    listCriterios: dracmasApi.listCriterios,
    createCriterio: dracmasApi.createCriterio,
    updateCriterio: dracmasApi.updateCriterio,
    resgatar: dracmasApi.redeem,
};

/** @deprecated Use financeApi from @/entities/finance */
export const FinanceiroService = {
    listarMensalidades: financeApi.listCobrancas,
    buscarConfiguracoes: financeApi.getConfig,
    salvarConfiguracoes: financeApi.updateConfig,
    confirmarPagamento: financeApi.confirmPayment,
    listPedidosMateriais: financeApi.listPedidosMateriais,
};

/** @deprecated Use financeReportsApi from @/entities/finance */
export const FinanceReportsAPI = {
    relatorioDracmas: financeReportsApi.relatorioDracmas,
    relatorioInadimplencia: financeReportsApi.relatorioInadimplencia,
};
