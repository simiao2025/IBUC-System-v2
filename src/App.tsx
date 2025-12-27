import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { router } from './router';

function App() {
  return (
    <AppProvider>
      <FeedbackProvider>
        <RouterProvider router={router} />
      </FeedbackProvider>
    </AppProvider>
  );
}

export default App;