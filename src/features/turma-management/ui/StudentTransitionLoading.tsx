import React from 'react';
import { DoorOpen, DoorClosed, User } from 'lucide-react';

interface StudentTransitionLoadingProps {
  message?: string;
  fromModule?: string | number;
  toModule?: string | number;
}

export const StudentTransitionLoading: React.FC<StudentTransitionLoadingProps> = ({ 
  message = "Migrando alunos...", 
  fromModule, 
  toModule 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl border border-teal-50 max-w-md w-full animate-in fade-in zoom-in duration-300">
      <div className="relative w-64 h-32 flex items-center justify-between mb-8">
        
        {/* Porta de Saída (Antigo Módulo) */}
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <DoorOpen className="w-10 h-10 text-gray-400" />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            Módulo {fromModule || 'Anterior'}
          </span>
        </div>

        {/* Trilho da Animação */}
        <div className="absolute left-12 right-12 h-0.5 bg-dashed bg-teal-100 flex items-center">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-teal-200 to-transparent animate-pulse" />
        </div>

        {/* Aluno Animado */}
        <div className="absolute left-10 animate-transition-student">
          <div className="bg-teal-500 p-2 rounded-full shadow-lg shadow-teal-200 ring-4 ring-white">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Porta de Entrada (Novo Módulo) */}
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
            <DoorClosed className="w-10 h-10 text-teal-600 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-tighter">
            Módulo {toModule || 'Novo'}
          </span>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-extrabold text-gray-800 mb-1">{message}</h3>
        <p className="text-sm text-gray-500">
          Preparando materiais e organizando o novo módulo.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes transition-student {
          0% { left: 40px; transform: scale(0.8); opacity: 0; }
          15% { opacity: 1; transform: scale(1); }
          85% { opacity: 1; transform: scale(1); }
          100% { left: calc(100% - 70px); transform: scale(0.8); opacity: 0; }
        }
        .animate-transition-student {
          animation: transition-student 2s infinite ease-in-out;
        }
      `}} />
    </div>
  );
};
