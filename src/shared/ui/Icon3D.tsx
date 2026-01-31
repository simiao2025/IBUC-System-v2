import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Icon3DProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  fallbackIcon?: LucideIcon;
  alt?: string;
}

const iconMap: Record<string, string> = {
  // Existing
  dashboard: '/icons/3d/dashboard.png',
  student: '/icons/3d/student.png',
  polos: '/icons/3d/polos.png',
  equipes_polos: '/icons/3d/equipes_polos.png',
  relatorios: '/icons/3d/relatorios.png',
  logo_prv: '/icons/3d/Logo-PRV-Texto-Branco.png',
  // Generated
  turmas: '/icons/3d/turmas.png',
  financeiro: '/icons/3d/financeiro.png',
  frequencia: '/icons/3d/frequencia.png',
  configuracoes: '/icons/3d/configuracoes.png',
  diretoria: '/icons/3d/diretoria.png',
  pre_matricula: '/icons/3d/pre_matricula.png',
  // Pending generation (fallbacks likely needed or placeholders)
  certificado: '/icons/3d/certificado.png',
  ensino: '/icons/3d/ensino.png',
  personalizado: '/icons/3d/personalizado.png',
  localizacao: '/icons/3d/localizacao.png',
  projeto_cristao: '/icons/3d/projeto_cristao.png',
  palavra_de_deus: '/icons/3d/palavra_de_deus.png',
  missao: '/icons/3d/missao.png',
  visao: '/icons/3d/visao.png',
  valores: '/icons/3d/valores.png',
  material: '/icons/3d/material.png',
  plataforma: '/icons/3d/plataforma.png',
  material_impresso: '/icons/3d/material_impresso.png',
  book: '/icons/3d/book.png',
};

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  '2xl': 'w-32 h-32',
  custom: '',
};

export const Icon3D: React.FC<Icon3DProps> = ({ 
  name, 
  size = 'md', 
  className = '', 
  fallbackIcon: Fallback,
  alt 
}) => {
  const [error, setError] = React.useState(false);
  const src = iconMap[name];
  const sizeClass = sizeMap[size];

  if (error || !src) {
    if (Fallback) {
      // Map sizes roughly to pixel values for Lucide if needed, or rely on parent sizing
      const iconSize = size === 'sm' ? 20 : size === 'md' ? 32 : 48;
      return <Fallback className={`${className} text-gray-500`} size={iconSize} />;
    }
    return null;
  }

  return (
    <img
      src={src}
      alt={alt || `${name} icon`}
      className={`object-contain ${sizeClass} ${className} transition-transform hover:scale-105 duration-200 mix-blend-multiply`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

export default Icon3D;
