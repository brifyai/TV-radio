import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GoogleAnalyticsProvider } from './contexts/GoogleAnalyticsContext';

// Components
import Login from './components/Auth/Login';
import Callback from './components/Auth/Callback';
import AnalyticsCallback from './components/Auth/AnalyticsCallback';
import Dashboard from './components/Dashboard/Dashboard';
import Accounts from './components/Accounts/Accounts';
import Properties from './components/Properties/Properties';
import Analytics from './components/Analytics/Analytics';
import SpotAnalysis from './components/SpotAnalysis/SpotAnalysis';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ UNHANDLED PROMISE REJECTION:', event.reason);
  event.preventDefault();
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('❌ UNCAUGHT ERROR:', event.error);
  console.error('❌ ERROR DETAILS:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Componente interno que usa el contexto de autenticación
function AppContent() {
  const { session, loading } = useAuth();

  // Mostrar loading solo si está cargando la sesión inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rutas públicas (sin autenticación requerida) */}
          <Route path="/callback" element={<Callback />} />
          <Route path="/analytics-callback" element={<AnalyticsCallback />} />
          
          {/* Rutas de autenticación */}
          {!session ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            /* Rutas protegidas (requieren autenticación) */
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/properties/:accountId" element={<Properties />} />
              <Route path="/analytics/:propertyId" element={<Analytics />} />
              <Route path="/spot-analysis" element={<SpotAnalysis />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          )}
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GoogleAnalyticsProvider>
            <AppContent />
          </GoogleAnalyticsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;