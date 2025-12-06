import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const modules = [
  {
    title: 'Módulo 01',
    subtitle: 'APRENDENDO A BÍBLIA',
    img: 'https://ibuc.com.br/wp-content/uploads/2023/05/mod1_livros.jpg',
    alt: 'Livros Módulo 01',
    link: '/modulo-01',
    gradient: 'from-blue-400 to-green-400',
    livros: 'A BÍBLIA, DEUS, JESUS',
  },
  {
    title: 'Módulo 02',
    subtitle: 'HISTÓRIAS BÍBLICAS',
    img: 'https://ibuc.com.br/wp-content/uploads/2023/05/mod2_livros.jpg',
    alt: 'Livros Módulo 02',
    link: '/modulo-02',
    gradient: 'from-yellow-400 to-orange-400',
    livros: 'HISTÓRIAS, PERSONAGENS',
  },
  {
    title: 'Módulo 03',
    subtitle: 'TERRAS BÍBLICAS',
    img: 'https://ibuc.com.br/wp-content/uploads/2023/05/mod3_livros.jpg',
    alt: 'Livros Módulo 03',
    link: '/modulo-03',
    gradient: 'from-purple-400 to-pink-400',
    livros: 'TERRAS BÍBLICAS, MAPAS',
  },
  {
    title: 'Módulo 04',
    subtitle: 'VALORES CRISTÃOS',
    img: 'https://ibuc.com.br/wp-content/uploads/2023/05/mod4_livros-300x225.jpg',
    alt: 'Livros Módulo 04',
    link: '/modulo-04',
    gradient: 'from-orange-400 to-red-400',
    livros: 'VALORES, PRINCÍPIOS',
  },
  {
    title: 'Módulo 05',
    subtitle: 'LIDERANÇA JUVENIL',
    img: 'https://ibuc.com.br/wp-content/uploads/2023/05/mod5_livros-300x225.jpg',
    alt: 'Livros Módulo 05',
    link: '/modulo-05',
    gradient: 'from-red-400 to-orange-400',
    livros: 'LIDERANÇA, MINISTÉRIO',
  },
  {
    title: 'Módulo 06',
    subtitle: 'OS PROFETAS',
    img: 'https://ibuc.com.br/wp-content/uploads/2023/05/mod6_livros-300x225.jpg',
    alt: 'Livros Módulo 06',
    link: '/modulo-06',
    gradient: 'from-pink-400 to-purple-400',
    livros: 'PROFETAS, ISAÍAS',
  },
  {
    title: 'Módulo 07',
    subtitle: 'EVANGELIZAÇÃO',
    img: 'https://ibuc.com.br/wp-content/uploads/2023/05/mod7_livros-300x225.jpg',
    alt: 'Livros Módulo 07',
    link: '/modulo-07',
    gradient: 'from-green-400 to-blue-400',
    livros: 'EVANGELIZAÇÃO, MISSÕES',
  },
  {
    title: 'Módulo 08',
    subtitle: 'ADORAÇÃO',
    img: 'https://ibuc.com.br/wp-content/uploads/2023/05/mod8_livros-300x225.jpg',
    alt: 'Livros Módulo 08',
    link: '/modulo-08',
    gradient: 'from-blue-400 to-green-400',
    livros: 'ADORAÇÃO, LOUVOR',
  },
  {
    title: 'Módulo 09',
    subtitle: 'MÚSICAS BÍBLICAS',
    img: 'https://ibuc.com.br/wp-content/uploads/2023/05/mod9_livros-300x225.jpg',
    alt: 'Livros Módulo 09',
    link: '/modulo-09',
    gradient: 'from-yellow-400 to-pink-400',
    livros: 'MÚSICAS, CÂNTICOS',
  },
  {
    title: 'Módulo 10',
    subtitle: 'VENDANDO O FUTURO',
    img: 'https://ibuc.com.br/wp-content/uploads/2023/05/mod10_livros-300x225.jpg',
    alt: 'Livros Módulo 10',
    link: '/modulo-10',
    gradient: 'from-purple-400 to-yellow-400',
    livros: 'FUTURO, APOCALIPSE',
  },
];

const ModulesPageClone: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar</span>
              </Link>
              <div className="h-8 w-px bg-white opacity-30"></div>
              <img
                src="https://ibuc.com.br/wp-content/uploads/2023/05/logo-site.png"
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Módulos
          </h2>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {modules.map((mod, idx) => (
            <Link
              to={mod.link}
              key={mod.title}
              className={`relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group focus:outline-none focus:ring-4 focus:ring-red-400`}
              tabIndex={0}
              aria-label={mod.title}
            >
              <div className={`bg-gradient-to-br ${mod.gradient} p-4 text-center h-full flex flex-col justify-between`}>
                <div>
                  <div className="text-white text-2xl font-bold mb-2">{mod.title}</div>
                  <div className="text-white text-lg font-semibold mb-4">{mod.subtitle}</div>
                </div>
                <div className="flex justify-center mb-4">
                  <img
                    src={mod.img}
                    alt={mod.alt}
                    className="w-28 h-28 object-contain rounded-lg mx-auto shadow-md border border-white"
                  />
                </div>
                <div className="text-white text-sm opacity-90 mb-2">
                  Livros: {mod.livros}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModulesPageClone;
