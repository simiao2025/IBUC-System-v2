import { CurrentUser } from '../interfaces/current-user.interface';

export class PoloScopeUtil {
    public static readonly GLOBAL_ROLES = [
        'super_admin',
        'admin_geral',
        'diretor_geral',
        'coordenador_geral',
        'secretario_geral',
        'tesoureiro_geral',
    ];

    public static isGlobal(user: CurrentUser): boolean {
        return this.GLOBAL_ROLES.includes(user.role);
    }

    public static hasAccessToPolo(user: CurrentUser, poloId: string): boolean {
        if (this.isGlobal(user)) {
            return true;
        }
        return user.polo_id === poloId;
    }
}
