import { poloApi } from '@/entities/polo';
import type { Polo } from '../types/database';

/**
 * @deprecated Use poloApi from @/entities/polo instead.
 */
export const PolosAPI = {
  criar: poloApi.create,
  listar: poloApi.list,
  buscarPorId: poloApi.getById,
  buscarPorCodigo: poloApi.getByCode,
  atualizar: poloApi.update,
  deletar: poloApi.delete,
};

/**
 * @deprecated Use poloApi from @/entities/polo instead.
 */
export class PoloService {
  static async listarPolos(): Promise<Polo[]> {
    return (await poloApi.list()) as Polo[];
  }

  static async buscarPoloPorId(id: string): Promise<Polo | null> {
    return (await poloApi.getById(id)) as Polo;
  }

  static async buscarPolosPorLocalizacao(cidade?: string, cep?: string): Promise<Polo[]> {
    return (await poloApi.listByLocation(cidade, cep)) as Polo[];
  }

  static async criarPolo(polo: Omit<Polo, 'id' | 'created_at' | 'updated_at'>): Promise<Polo> {
    return (await poloApi.create(polo)) as Polo;
  }

  static async atualizarPolo(id: string, updates: Partial<Polo>): Promise<Polo> {
    return (await poloApi.update(id, updates)) as Polo;
  }

  static async deletarPolo(id: string): Promise<void> {
    await poloApi.delete(id);
  }
}
