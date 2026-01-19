import { enrollmentApi } from '@/entities/enrollment';

/**
 * @deprecated Use enrollmentApi from @/entities/enrollment instead.
 */
export const ListaEsperaAPI = {
    cadastrar: enrollmentApi.waitlistRegister,
    listar: enrollmentApi.waitlistList
};

/**
 * @deprecated Use enrollmentApi from @/entities/enrollment instead.
 */
export class ListaEsperaService {
    static cadastrar = enrollmentApi.waitlistRegister;
    static listar = enrollmentApi.waitlistList;
}
