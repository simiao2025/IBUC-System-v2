import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import { useApp } from '../context/AppContext';
import { AlunosAPI } from '../features/students/aluno.service';
import { PoloService } from '../services/polo.service';
import { TurmaService } from '../services/turma.service';
import type { Aluno, Nivel } from '../types/database';

interface AppLayoutProps {
  children: React.ReactNode;
}

type AlunoWithNames = Aluno & {
  polo_nome?: string;
  nivel_nome?: string;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Aluno | null>(null);
  const [poloName, setPoloName] = useState<string>('');
  const [nivelName, setNivelName] = useState<string>('');

  useEffect(() => {
    const loadStudentHeader = async () => {
      if (!currentUser || currentUser.role !== 'student' || !currentUser.studentId) {
        setStudent(null);
        setPoloName('');
        setNivelName('');
        return;
      }

      try {
        const aluno = (await AlunosAPI.buscarPorId(currentUser.studentId)) as AlunoWithNames;
        setStudent(aluno);

        const inferredPoloName = aluno.polo_nome;
        if (inferredPoloName) {
          setPoloName(inferredPoloName);
        } else if (aluno.polo_id) {
          const polo = await PoloService.buscarPoloPorId(aluno.polo_id);
          setPoloName(polo?.nome || '');
        } else {
          setPoloName('');
        }

        const inferredNivelName = aluno.nivel_nome;
        if (inferredNivelName) {
          setNivelName(inferredNivelName);
        } else if (aluno.nivel_atual_id) {
          const niveis = (await TurmaService.listarNiveis()) as Nivel[];
          const nivel = (Array.isArray(niveis) ? niveis : []).find(n => n.id === aluno.nivel_atual_id);
          setNivelName(nivel?.nome || aluno.nivel_atual_id);
        } else {
          setNivelName('');
        }
      } catch (e) {
        console.error('Erro ao carregar dados do aluno (layout):', e);
        setStudent(null);
        setPoloName('');
        setNivelName('');
      }
    };

    loadStudentHeader();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <img
                src="https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png"
                alt="IBUC Logo"
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Painel do Aluno
                  {poloName ? (
                    <span className="ml-2 text-green-700">
                      - <strong>{poloName}</strong>
                    </span>
                  ) : null}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <p className="text-sm text-gray-600">IBUC - Palmas, TO</p>
                  {student?.nome ? (
                    <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                      <span className="text-sm font-medium text-gray-700">
                        Olá, <span className="font-bold">{student.nome}</span>
                      </span>
                      {nivelName ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-semibold">
                          {nivelName}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};

export default AppLayout;
