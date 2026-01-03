import React, { useState, useEffect, useMemo } from 'react';
import { Search, User } from 'lucide-react';
import { AlunosAPI } from '../../features/students/aluno.service';
import type { Aluno } from '../../types/database';

interface StudentSearchProps {
  value: string;
  onChange: (studentId: string) => void;
  placeholder?: string;
  className?: string;
  poloId?: string;
}

const StudentSearch: React.FC<StudentSearchProps> = ({
  value,
  onChange,
  placeholder = "Buscar aluno...",
  className = "",
  poloId
}) => {
  const [students, setStudents] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Carregar alunos do banco
  useEffect(() => {
    const carregarAlunos = async () => {
      try {
        setLoading(true);
        const data = await AlunosAPI.listar({ polo_id: poloId });
        setStudents(data || []);
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    carregarAlunos();
  }, [poloId]);

  // Filtrar alunos em ordem alfabética
  const filteredStudents = useMemo(() => {
    if (!searchTerm) {
      return students.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return students
      .filter(student => 
        student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cpf?.includes(searchTerm) ||
        student.id.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [students, searchTerm]);

  // Encontrar aluno selecionado
  const selectedStudent = students.find(s => s.id === value);

  const handleSelect = (student: Aluno) => {
    onChange(student.id);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input de busca */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {selectedStudent ? <User className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        </div>
        <input
          type="text"
          value={searchTerm || (selectedStudent ? selectedStudent.nome : '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedStudent ? selectedStudent.nome : placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {selectedStudent && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && !selectedStudent && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-gray-500 text-center">
              Carregando alunos...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-3 text-gray-500 text-center">
              {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => handleSelect(student)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{student.nome}</div>
                    <div className="text-sm text-gray-500">
                      ID: {student.id} | CPF: {student.cpf || 'N/A'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {student.status === 'ativo' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Ativo</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">Inativo</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Fechar dropdown ao clicar fora */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default StudentSearch;
