import { Injectable } from '@nestjs/common';

@Injectable()
export class UserMetaService {
    async listarRoles() {
        return [
            { value: 'super_admin', label: 'Super Admin' },
            { value: 'admin_geral', label: 'Admin Geral' },

            // Diretoria Geral
            { value: 'diretor_geral', label: 'Diretor Geral' },
            { value: 'vice_diretor_geral', label: 'Vice-Diretor Geral' },
            { value: 'coordenador_geral', label: '1º Coordenador Geral' },
            { value: 'vice_coordenador_geral', label: '2º Coordenador Geral' },
            { value: 'primeiro_secretario_geral', label: '1º Secretário Geral' },
            { value: 'segundo_secretario_geral', label: '2º Secretário Geral' },
            { value: 'primeiro_tesoureiro_geral', label: '1º Tesoureiro Geral' },
            { value: 'segundo_tesoureiro_geral', label: '2º Tesoureiro Geral' },

            // Diretoria de Polo
            { value: 'diretor_polo', label: 'Diretor do Polo' },
            { value: 'vice_diretor_polo', label: 'Vice-Diretor do Polo' },
            { value: 'coordenador_polo', label: '1º Coordenador do Polo' },
            { value: 'vice_coordenador_polo', label: '2º Coordenador do Polo' },
            { value: 'primeiro_secretario_polo', label: '1º Secretário do Polo' },
            { value: 'segundo_secretario_polo', label: '2º Secretário do Polo' },
            { value: 'primeiro_tesoureiro_polo', label: '1º Tesoureiro do Polo' },
            { value: 'segundo_tesoureiro_polo', label: '2º Tesoureiro do Polo' },
            
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
