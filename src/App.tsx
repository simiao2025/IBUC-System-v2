import React from 'react';
import { ErrorBoundary } from '@/shared/ui';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './app/providers/AppContext';
import { FeedbackProvider } from './shared/lib/context/FeedbackContext';
import { router } from './router';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <FeedbackProvider>
          <RouterProvider router={router} />
        </FeedbackProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
