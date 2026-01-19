import { Endereco, StatusPolo } from '@/shared/types';

export interface Polo {
  id: string;
  nome: string;
  codigo?: string;
  endereco: Endereco;
  status: StatusPolo;
  created_at: string;
  updated_at: string;
}

// Compatibilidade Legada (Frontend Types)
export interface PoloLegacy {
  id: string;
  name: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    phone?: string;
    email?: string;
  };
  pastor: string;
  coordinator: {
    name: string;
    cpf: string;
  };
  director?: {
    name: string;
    cpf: string;
  };
  teachers: string[];
  assistants?: string[];
  secretary?: {
    name: string;
    cpf: string;
  };
  treasurer?: {
    name: string;
    cpf: string;
  };
  cafeteriaWorkers?: string[];
  availableLevels: any[]; 
  isActive: boolean;
  createdAt: string;
}

export interface PoloFiltros {
  ativo?: boolean;
  search?: string;
}
