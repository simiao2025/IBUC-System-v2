import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PoloLegacy as UiPolo, Level } from '../model/types';
import { poloApi } from '../api/polo.api';
import { Polo as DbPolo } from '@/shared/api/types/database';

interface PoloContextType {
  polos: UiPolo[];
  addPolo: (polo: UiPolo) => void;
  updatePolo: (id: string, polo: UiPolo) => void;
  deletePolo: (id: string) => void;
}

const PoloContext = createContext<PoloContextType | undefined>(undefined);

const DEFAULT_LEVELS: Level[] = ['NIVEL_I', 'NIVEL_II', 'NIVEL_III', 'NIVEL_IV'];

const mapDbPoloToUiPolo = (polo: DbPolo): UiPolo => ({
  id: polo.id,
  name: polo.nome,
  address: {
    street: polo.endereco.rua,
    number: polo.endereco.numero,
    neighborhood: polo.endereco.bairro,
    city: polo.endereco.cidade,
    state: polo.endereco.estado,
    cep: polo.endereco.cep,
  },
  pastor: polo.pastor_responsavel || '',
  coordinator: {
    name: '',
    cpf: '',
  },
  director: undefined,
  teachers: [],
  assistants: [],
  secretary: undefined,
  treasurer: undefined,
  cafeteriaWorkers: [],
  availableLevels: DEFAULT_LEVELS,
  isActive: polo.status === 'ativo',
  createdAt: polo.created_at,
});

export const PoloProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [polos, setPolos] = useState<UiPolo[]>([]);

  useEffect(() => {
    const loadPolos = async () => {
      try {
        const response = await poloApi.list();
        if (Array.isArray(response)) {
          // Cast to DbPolo[] since the API returns the database structure
          setPolos((response as DbPolo[]).map(mapDbPoloToUiPolo));
        }
      } catch (error) {
        console.error('PoloProvider - Erro ao carregar polos:', error);
      }
    };
    loadPolos();
  }, []);

  const addPolo = (polo: UiPolo) => {
    setPolos(prev => [...prev, polo]);
  };

  const updatePolo = (id: string, updatedPolo: UiPolo) => {
    setPolos(prev => prev.map(p => p.id === id ? updatedPolo : p));
  };

  const deletePolo = (id: string) => {
    setPolos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PoloContext.Provider value={{ polos, addPolo, updatePolo, deletePolo }}>
      {children}
    </PoloContext.Provider>
  );
};

export const usePolos = () => {
  const context = useContext(PoloContext);
  if (context === undefined) {
    throw new Error('usePolos must be used within a PoloProvider');
  }
  return context;
};
