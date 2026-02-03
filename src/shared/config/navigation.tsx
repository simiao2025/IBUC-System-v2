import {
  Users,
  MapPin,
  BookOpen,
  UserCheck,
  Building2,
  ClipboardList,
  DollarSign,
  ShoppingCart,
  BarChart3,
  FileCheck,
  Settings
} from 'lucide-react';

export interface NavItem {
  title: string;
  description: string;
  href: string;
  iconName: string;
  fallbackIcon: any;
  color: string;
  module: string;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'Módulos',
    description: 'Cadastro e edição de módulos e lições',
    href: '/admin/modulos',
    iconName: 'turmas',
    fallbackIcon: BookOpen,
    color: 'bg-purple-600 hover:bg-purple-700',
    module: 'lessons' // Módulos de ensino, não configurações
  },
  {
    title: 'Diretoria',
    description: 'Cadastro e gestão da diretoria',
    href: '/admin/diretoria',
    iconName: 'diretoria',
    fallbackIcon: Building2,
    color: 'bg-red-600 hover:bg-red-700',
    module: 'directorate'
  },
  {
    title: 'Gerenciar Polos',
    description: 'Cadastro completo de polos e congregações',
    href: '/admin/polos',
    iconName: 'polos',
    fallbackIcon: MapPin,
    color: 'bg-blue-600 hover:bg-blue-700',
    module: 'polos'
  },
  {
    title: 'Gerenciar Alunos',
    description: 'Matrículas, editar e gerenciar dados dos alunos',
    href: '/admin/alunos',
    iconName: 'student',
    fallbackIcon: Users,
    color: 'bg-green-600 hover:bg-green-700',
    module: 'students'
  },
  {
    title: 'Equipes',
    description: 'Coordenadores, professores e auxiliares',
    href: '/admin/equipe',
    iconName: 'equipes_polos',
    fallbackIcon: UserCheck,
    color: 'bg-teal-600 hover:bg-teal-700',
    module: 'staff'
  },
  {
    title: 'Gerenciar Turmas',
    description: 'Cadastro e gestão de turmas e níveis',
    href: '/admin/turmas',
    iconName: 'turmas',
    fallbackIcon: BookOpen,
    color: 'bg-purple-600 hover:bg-purple-700',
    module: 'enrollments'
  },
  {
    title: 'Frequência/Drácmas',
    description: 'Controle de presença e Drácmas',
    href: '/admin/frequencia',
    iconName: 'frequencia',
    fallbackIcon: ClipboardList,
    color: 'bg-orange-600 hover:bg-orange-700',
    module: 'attendance'
  },
  {
    title: 'Financeiro',
    description: 'Gestão financeira e faturas',
    href: '/admin/financeiro',
    iconName: 'financeiro',
    fallbackIcon: DollarSign,
    color: 'bg-yellow-600 hover:bg-yellow-700',
    module: 'financeiro'
  },
  {
    title: 'Gerenciar Materiais',
    description: 'Cadastro de materiais e gestão de pedidos',
    href: '/admin/materiais',
    iconName: 'materiais',
    fallbackIcon: ShoppingCart,
    color: 'bg-red-600 hover:bg-red-700',
    module: 'materials'
  },
  {
    title: 'Relatórios',
    description: 'Gerar relatórios e estatísticas',
    href: '/admin/relatorios',
    iconName: 'relatorios',
    fallbackIcon: BarChart3,
    color: 'bg-gray-600 hover:bg-gray-700',
    module: 'reports'
  },
  {
    title: 'Gerenciar Pré-matrículas',
    description: 'Análise de documentos e conclusão de novas matrículas',
    href: '/admin/pre-matriculas',
    iconName: 'pre_matricula',
    fallbackIcon: FileCheck,
    color: 'bg-orange-500 hover:bg-orange-600',
    module: 'pre-enrollments'
  },
  {
    title: 'Configurações',
    description: 'Usuários, acessos e configurações do sistema',
    href: '/admin/configuracoes',
    iconName: 'configuracoes',
    fallbackIcon: Settings,
    color: 'bg-indigo-600 hover:bg-indigo-700',
    module: 'settings'
  }
];
