/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cores obrigatórias do sistema IBUC
        ibuc: {
          yellow: '#FFC107',
          blue: '#2196F3',
          green: '#4CAF50',
          red: '#F44336',
        },
      },
    },
  },
  plugins: [],
};
