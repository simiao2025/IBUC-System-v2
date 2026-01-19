import { poloApi } from '@/entities/polo';

/**
 * @deprecated Use poloApi from @/entities/polo instead.
 */
export const DiretoriaAPI = {
  criarGeral: poloApi.createDirectoryGeral,
  listarGeral: poloApi.listDirectoryGeral,
  buscarGeralPorId: poloApi.getDirectoryGeralById,
  atualizarGeral: poloApi.updateDirectoryGeral,
  desativarGeral: poloApi.deactivateDirectoryGeral,
  
  criarPolo: poloApi.createDirectoryPolo,
  listarPolo: poloApi.listDirectoryPolo,
  buscarPoloPorId: poloApi.getDirectoryPoloById,
  atualizarPolo: poloApi.updateDirectoryPolo,
  desativarPolo: poloApi.deactivateDirectoryPolo,
};

/**
 * @deprecated Use poloApi from @/entities/polo instead.
 */
export class DiretoriaService {
  static listarDiretoriaGeral = poloApi.listDirectoryGeral;
  static buscarDiretoriaGeralPorId = poloApi.getDirectoryGeralById;
  static criarDiretoriaGeral = poloApi.createDirectoryGeral;
  static atualizarDiretoriaGeral = poloApi.updateDirectoryGeral;
  static desativarDiretoriaGeral = poloApi.deactivateDirectoryGeral;

  static listarDiretoriaPolo = poloApi.listDirectoryPolo;
  static criarDiretoriaPolo = (dados: any) => poloApi.createDirectoryPolo(dados.polo_id, dados);
  static atualizarDiretoriaPolo = poloApi.updateDirectoryPolo;
  static desativarDiretoriaPolo = poloApi.deactivateDirectoryPolo;
}
