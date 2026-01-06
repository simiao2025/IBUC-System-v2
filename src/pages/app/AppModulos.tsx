import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const AppModulos: React.FC = () => {
  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="secondary" size="sm" className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white">
          <Link to="/app/dashboard">Voltar</Link>
        </Button>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Módulos</h1>
      <p className="text-sm text-gray-600">
        Lista de módulos do aluno será implementada conforme PRD nas fases de Área do Aluno.
      </p>
    </div>
  );
};

export default AppModulos;
