import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import LoadingSpinner from '../UI/LoadingSpinner';

const Callback = () => {
  const navigate = useNavigate();
  const { handleAnalyticsCallback } = useGoogleAnalytics();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Parsear los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const isAnalyticsCallback = urlParams.get('analytics') === 'true';
        
        if (error) {
          console.error('Error en callback de autenticación:', error);
          setError('Error en la autenticación: ' + error);
          setLoading(false);
          return;
        }

        console.log('🔍 DEBUG Callback:');
        console.log('  - URL:', window.location.href);
        console.log('  - code:', code ? 'found' : 'not found');
        console.log('  - analytics:', isAnalyticsCallback);

        // Usar el método getSession de Supabase que maneja automáticamente el intercambio de código
        console.log('Procesando callback de Supabase...');
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error obteniendo sesión:', sessionError.message);
          setError('Error en la autenticación: ' + sessionError.message);
          setLoading(false);
          return;
        }

        if (data?.session) {
          console.log('✅ Sesión establecida:', data.session.user.email);
          
          // Si es un callback de Google Analytics, procesar los tokens de GA
          if (isAnalyticsCallback) {
            console.log('📊 Procesando conexión de Google Analytics...');
            try {
              // Obtener el provider token de la sesión de Supabase
              const providerToken = data.session.provider_token;
              const refreshToken = data.session.provider_refresh_token;
              
              if (providerToken) {
                // Guardar tokens de Google Analytics en la base de datos
                await supabase
                  .from('users')
                  .update({
                    google_access_token: providerToken,
                    google_refresh_token: refreshToken,
                    google_token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hora
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', data.session.user.id);
                  
                console.log('✅ Google Analytics conectado exitosamente');
              } else {
                console.warn('⚠️ No se encontró provider_token en la sesión');
              }
            } catch (analyticsError) {
              console.error('❌ Error guardando tokens de Analytics:', analyticsError);
              setError('Error conectando Google Analytics: ' + analyticsError.message);
              setLoading(false);
              return;
            }
          }
          
          navigate('/dashboard', { replace: true });
        } else {
          // Si getSession no funciona, intentar con exchangeCodeForSession
          console.log('⚠️getSession no encontró sesión, intentando exchangeCodeForSession...');
          if (code) {
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
            
            if (exchangeError) {
              console.error('Error intercambiando código por sesión:', exchangeError.message);
              setError('Error en la autenticación: ' + exchangeError.message);
              setLoading(false);
              return;
            }

            if (exchangeData?.session) {
              console.log('✅ Sesión establecida vía exchange:', exchangeData.session.user.email);
              navigate('/dashboard', { replace: true });
            } else {
              setError('No se pudo establecer la sesión');
              setLoading(false);
            }
          } else {
            setError('No se encontró código de autorización');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('❌ Error inesperado en callback:', err);
        setError('Error inesperado durante la autenticación: ' + err.message);
        setLoading(false);
      }
    };

    // Delay para asegurar que la página esté completamente cargada
    const timer = setTimeout(handleAuthCallback, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Completando autenticación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error de Autenticación</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Volver al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Callback;
