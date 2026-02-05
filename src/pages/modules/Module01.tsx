import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const Module01: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-400 to-blue-600">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/modulos" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar</span>
              </Link>
              <div className="h-8 w-px bg-white opacity-30"></div>
              <img
                src="/icons/3d/logo-IBUC.png"
                alt="IBUC Logo"
                className="h-12 w-auto"
              />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold">IBUC - Palmas, TO</h1>
              <p className="text-sm opacity-90">Instituto Bíblico Único Caminho</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Section - Hero with Books */}
      <div className="relative bg-gradient-to-r from-blue-300 to-teal-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Module Title */}
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Módulo 01</h2>
            <div className="text-9xl font-bold text-blue-200 opacity-50">01</div>
          </div>

          {/* Books Image */}
          <div className="flex justify-center mb-8">
            <img
              src="https://ibuc.com.br/wp-content/uploads/2023/05/mod1_livros.jpg"
              alt="Livros do Módulo 01 - Entendendo a Bíblia"
              className="max-w-4xl w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Separator Line */}
      <div className="h-px bg-white opacity-30"></div>

      {/* Bottom Section - Lessons */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Lessons Image */}
          <div className="flex justify-center mb-12">
            <img
              src="https://ibuc.com.br/wp-content/uploads/2023/05/mod1_licoes.jpg"
              alt="Lições do Módulo 01 - Entendendo a Bíblia"
              className="max-w-4xl w-full h-auto rounded-lg shadow-2xl"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="text-center mb-8">
            <div className="flex justify-center gap-4">
              <Link
                to="/modulos"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Link>
              <Link
                to="/modulo-02"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
              >
                <span>Módulo 02</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            to="/modulos"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar aos Módulos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Module01;