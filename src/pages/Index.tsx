import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';

/**
 * Index page component - the main entry point for the application
 * Wraps the AppLayout with the AppProvider to provide global state management
 */
const Index: React.FC = () => {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
};

export default Index;