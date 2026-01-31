import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div>
                <img
                  src="/icons/3d/Logo-PRV-Texto-Branco.png"
                  alt="Logo Projeto Restaurando Vidas"
                  className="h-14 w-auto mb-2"
                />
                <p className="text-gray-300 text-sm leading-relaxed">
                  ASR-SE 75, Alameda 2, Lote 53, Plano Diretor Sul. Palmas-Tocantins – Brasil.
                </p>
                <a 
                  href="https://admissaoprv.com.br/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-block mt-1"
                >
                  admissaoprv.com.br
                </a>
              </div>
              <div className="flex items-center space-x-3 pt-4">
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
              <div className="flex flex-col space-y-2 pt-2">
                <a 
                  href="https://admissaoprv.com.br/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                >
                  admissaoprv.com.br
                </a>
                <a 
                  href="https://ibuc.com.br/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                >
                  ibuc.com.br
                </a>
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
              <Link to="/sobre" className="text-gray-300 hover:text-white transition-colors">
                Sobre o IBUC
              </Link>
              <Link to="/#niveis" className="text-gray-300 hover:text-white transition-colors">
                Níveis de Ensino
              </Link>
              <Link to="/#polos" className="text-gray-300 hover:text-white transition-colors">
                Nossos Polos
              </Link>
              <Link to="/privacidade" className="text-gray-300 hover:text-white transition-colors">
                Política de Privacidade
              </Link>
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