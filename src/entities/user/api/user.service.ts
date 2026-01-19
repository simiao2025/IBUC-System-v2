import { userApi } from '@/entities/user';

/**
 * @deprecated Use userApi from @/entities/user instead.
 */
export const UserService = {
    list: userApi.list,
    getById: userApi.getById,
    getByEmail: userApi.getByEmail,
    create: userApi.create,
    update: userApi.update,
    delete: userApi.delete,
    login: userApi.login,
    loginAluno: userApi.loginAluno,
    solicitarRecuperacaoSenha: userApi.solicitarRecuperacaoSenha,
    confirmarRecuperacaoSenha: userApi.confirmarRecuperacaoSenha,
    listRoles: userApi.listRoles,
    listAccessLevels: userApi.listAccessLevels,
};
