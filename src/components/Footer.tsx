import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png"
                alt="IBUC Logo"
                className="h-8 w-auto"
              />
              <div>
                <h3 className="text-lg font-bold text-white">IBUC</h3>
                <p className="text-sm text-gray-300">Instituto Bíblico Único Caminho</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Formando crianças e jovens nos caminhos do Senhor através do ensino bíblico de qualidade.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contato</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-red-400" />
                <span>Palmas - Tocantins</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-red-400" />
                <span>(63) 9999-9999</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-red-400" />
                <span>contato@ibuc.com.br</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-red-400" />
                <span>Segunda a Sexta: 8h às 17h</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Links Rápidos</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Sobre o IBUC
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Níveis de Ensino
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Nossos Polos
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2025 Instituto Bíblico Único Caminho - IBUC. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;