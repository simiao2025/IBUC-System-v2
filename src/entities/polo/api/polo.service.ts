import { poloApi } from './polo.api';

/** @deprecated Use poloApi from @/entities/polo */
export const PolosAPI = {
  listarPolos: poloApi.list,
  buscarPoloPorId: poloApi.getById,
  criarPolo: poloApi.create,
  atualizarPolo: poloApi.update,
  deletarPolo: poloApi.delete,
  listar: poloApi.list,
};

/** @deprecated Use poloApi from @/entities/polo */
export const PoloService = PolosAPI;
