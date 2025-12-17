import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { supabase } from './config/supabase';
import { AuthProvider } from './contexts/AuthContext';
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


function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error getting session:', error.message);
        }
        setSession(session);
        setLoading(false);
        
        // Persist session state for navigation
        if (session) {
          sessionStorage.setItem('supabase.auth.token', JSON.stringify(session));
        } else {
          sessionStorage.removeItem('supabase.auth.token');
        }
      } catch (error) {
        console.warn('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setSession(session);
          setLoading(false);
          
          // Persist session state for navigation
          if (session) {
            sessionStorage.setItem('supabase.auth.token', JSON.stringify(session));
          } else {
            sessionStorage.removeItem('supabase.auth.token');
          }
          
          console.log('🔄 Auth state changed:', event, session?.user?.email);
        } catch (error) {
          console.warn('Error in auth state change:', error);
          setLoading(false);
        }
      }
    );

    // Handle browser navigation (back/forward buttons)
    const handlePopState = () => {
      console.log('🔙 Browser navigation detected');
      
      // Try to restore session from storage
      const storedSession = sessionStorage.getItem('supabase.auth.token');
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          setSession(parsedSession);
          setLoading(false);
          console.log('✅ Session restored from storage');
        } catch (error) {
          console.warn('Error parsing stored session:', error);
          sessionStorage.removeItem('supabase.auth.token');
        }
      } else {
        // No stored session, verify with Supabase
        getInitialSession();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GoogleAnalyticsProvider>
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
          </GoogleAnalyticsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;