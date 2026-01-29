import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/common/ErrorBoundary.tsx';
import './index.css';

// Hide loading screen when React is ready
const hideLoadingScreen = () => {
  const loadingElement = document.getElementById('app-loading');
  const rootElement = document.getElementById('root');
  
  if (loadingElement && rootElement) {
    // Add loaded class to root for fade in
    rootElement.classList.add('loaded');
    
    // Fade out loading screen
    loadingElement.classList.add('fade-out');
    
    // Remove loading element after transition
    setTimeout(() => {
      loadingElement.remove();
    }, 500); // Match CSS transition duration
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Hide loading after React mounts
setTimeout(hideLoadingScreen, 300);
