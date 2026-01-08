import { Injectable } from '@nestjs/common';

@Injectable()
export class UserMetaService {
    async listarRoles() {
        return [
            { value: 'super_admin', label: 'Super Admin' },
            { value: 'admin_geral', label: 'Admin Geral' },
            { value: 'diretor_geral', label: 'Diretor Geral' },
            { value: 'coordenador_geral', label: 'Coordenador Geral' },
            { value: 'secretario_geral', label: 'Secretário(a) Geral' },
            { value: 'tesoureiro_geral', label: 'Tesoureiro(a) Geral' },
            { value: 'diretor_polo', label: 'Diretor de Polo' },
            { value: 'coordenador_polo', label: 'Coordenador de Polo' },
            { value: 'secretario_polo', label: 'Secretário(a) do Polo' },
            { value: 'tesoureiro_polo', label: 'Tesoureiro(a) do Polo' },
            { value: 'professor', label: 'Professor' },
            { value: 'auxiliar', label: 'Auxiliar' },
            { value: 'aluno', label: 'Aluno' },
            { value: 'responsavel', label: 'Responsável' },
        ];
    }

    async listarAccessLevels() {
        return [
            { value: 'geral', label: 'Acesso Geral' },
            { value: 'polo_especifico', label: 'Polo Específico' },
        ];
    }
}
