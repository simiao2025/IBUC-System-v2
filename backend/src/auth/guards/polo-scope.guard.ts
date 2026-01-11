import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_POLO_SCOPE_KEY } from '../decorators/skip-polo-scope.decorator';
import { PoloScopeUtil } from '../utils/polo-scope.util';
import { CurrentUser } from '../interfaces/current-user.interface';

@Injectable()
export class PoloScopeGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const skipPoloScope = this.reflector.getAllAndOverride<boolean>(
            SKIP_POLO_SCOPE_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (skipPoloScope) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: CurrentUser = request.user;
        const { polo_id } = request.query;

        if (!user) {
            return false;
        }

        // Se o usuário é global, ele pode acessar tudo
        if (PoloScopeUtil.isGlobal(user)) {
            return true;
        }

        // Se o usuário não é global, ele SÓ pode acessar o seu próprio polo
        // Se o polo_id for informado na query, validamos se é o dele
        if (polo_id && user.polo_id !== polo_id) {
            throw new ForbiddenException(
                'Você não tem permissão para acessar dados de outro polo.',
            );
        }

        // Se não informou polo_id na query, mas o usuário é de polo,
        // o service deverá forçar o polo_id do usuário (isso será feito na Fase 2)

        return true;
    }
}
