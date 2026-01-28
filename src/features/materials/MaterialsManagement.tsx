import React, { useState } from 'react';
import PageHeader from '@/shared/ui/PageHeader';
import { Package, ShoppingCart } from 'lucide-react';
import MaterialCatalog from './MaterialCatalog';
import MaterialOrderManagement from './MaterialOrderManagement';

type ActiveTab = 'catalog' | 'orders';

const MaterialsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Gerenciar Materiais"
        subtitle="Cadastro de materiais didáticos e gestão de pedidos"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'catalog'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="inline w-4 h-4 mr-2" />
                Cadastrar Materiais
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'orders'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShoppingCart className="inline w-4 h-4 mr-2" />
                Pedido de Materiais
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'catalog' && <MaterialCatalog />}
          {activeTab === 'orders' && <MaterialOrderManagement />}
        </div>
      </div>
    </div>
  );
};

export default MaterialsManagement;
