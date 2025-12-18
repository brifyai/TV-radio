import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GoogleAnalyticsProvider } from './contexts/GoogleAnalyticsContext';

// Components
import Login from './components/Auth/Login';
import Landing from './components/Auth/Landing';
import Callback from './components/Auth/Callback';
import AnalyticsCallback from './components/Auth/AnalyticsCallback';
import Dashboard from './components/Dashboard/Dashboard';
import Accounts from './components/Accounts/Accounts';
import Properties from './components/Properties/Properties';
import Analytics from './components/Analytics/Analytics';
import SpotAnalysis from './components/SpotAnalysis/SpotAnalysis';
import FrasesRadio from './components/FrasesRadio/FrasesRadio';
import Settings from './components/Settings/Settings';
import Layout from './components/Layout/Layout';
import SimpleLoadingSpinner from './components/UI/SimpleLoadingSpinner';
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
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Timeout de seguridad para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ TIMEOUT: Loading took too long, forcing completion');
        setTimeoutReached(true);
      }
    }, 10000); // 10 segundos timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // Mostrar loading solo si está cargando la sesión inicial Y no se ha alcanzado el timeout
  if (loading && !timeoutReached) {
    return (
      <SimpleLoadingSpinner
        size="lg"
        message="Inicializando aplicación..."
      />
    );
  }

  // Si se alcanzó el timeout, asumir que no hay sesión y mostrar login
  if (timeoutReached) {
    console.warn('⚠️ TIMEOUT REACHED: Assuming no session');
    return (
      <Router>
        <div className="App">
          <Routes>
            <Route path="/callback" element={<Callback />} />
            <Route path="/analytics-callback" element={<AnalyticsCallback />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
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
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
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
              <Route path="/frases-radio" element={<FrasesRadio />} />
              <Route path="/settings" element={<Settings />} />
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