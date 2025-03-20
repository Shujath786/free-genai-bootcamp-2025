import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DataForm from './components/DataForm';

// Create a single QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>Data Entry Application</h1>
        <DataForm />
      </div>
    </QueryClientProvider>
  );
}

export default App; 