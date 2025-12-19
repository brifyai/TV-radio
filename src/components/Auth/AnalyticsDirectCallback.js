import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import { supabase } from '../../config/supabase';
import LoadingSpinner from '../UI/LoadingSpinner';

const AnalyticsDirectCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleDirectAnalyticsCallback = async () => {
      try {
        console.log('🔒 CRITICAL: Procesando callback DIRECTO de Google Analytics (sin Supabase OAuth)');
        
        // Parsear los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state');
        
        if (error) {
          console.error('Error en callback de Google Analytics:', error);
          setError('Error en la conexión con Google Analytics: ' + error);
          setLoading(false);
          return;
        }

        if (!code) {
          setError('No se encontró código de autorización de Google Analytics');
          setLoading(false);
          return;
        }

        // CRITICAL: Recuperar información del usuario original del sessionStorage
        const originalUserId = sessionStorage.getItem('original_user_id');
        const originalUserEmail = sessionStorage.getItem('original_user_email');
        const isAnalyticsFlow = sessionStorage.getItem('analytics_oauth_flow') === 'true';
        
        console.log('🔒 CRITICAL: Datos recuperados del sessionStorage:');
        console.log('  - Original User ID:', originalUserId);
        console.log('  - Original User Email:', originalUserEmail);
        console.log('  - Analytics Flow:', isAnalyticsFlow);

        if (!isAnalyticsFlow || !originalUserId || !originalUserEmail) {
          throw new Error('Flujo de Analytics no válido. Por favor, inicia sesión y vuelve a intentar.');
        }

        // CRITICAL: Verificar que la sesión original aún esté activa
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession) {
          throw new Error('La sesión original ha expirado. Por favor, inicia sesión nuevamente.');
        }

        if (currentSession.user.id !== originalUserId || currentSession.user.email !== originalUserEmail) {
          console.error('❌ CRITICAL: Cambio de usuario detectado incluso en flujo directo');
          console.error('❌ Esperado:', originalUserEmail);
          console.error('❌ Actual:', currentSession.user.email);
          throw new Error('Error crítico de seguridad: Se detectó un cambio de usuario no autorizado.');
        }

        console.log('✅ CRITICAL: Sesión original verificada correctamente:', currentSession.user.email);

        // Importar el servicio de Google Analytics
        const { googleAnalyticsService } = await import('../../services/googleAnalyticsService');

        // CRITICAL: Exchange code for tokens DIRECTAMENTE con Google (sin Supabase)
        console.log('🔒 CRITICAL: Intercambiando código por tokens directamente con Google...');
        const tokens = await googleAnalyticsService.exchangeCodeForTokens(
          code, 
          `${window.location.origin}/analytics-callback`
        );

        console.log('✅ CRITICAL: Tokens obtenidos exitosamente de Google');

        // Obtener información del usuario de Google (solo para logging, no para sesión)
        const googleUserInfo = await googleAnalyticsService.getUserInfo(tokens.access_token);
        console.log('🔍 INFO: Cuenta de Google conectada:', googleUserInfo.email);
        console.log('🔒 CRITICAL: Esta cuenta NO afectará la sesión del usuario');

        // CRITICAL: Almacenar tokens en la base de datos del usuario original
        const { error: updateError } = await supabase
          .from('users')
          .update({
            google_access_token: tokens.access_token,
            google_refresh_token: tokens.refresh_token,
            google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', originalUserId); // Usar ID del usuario original

        if (updateError) {
          console.error('❌ Error almacenando tokens:', updateError);
          throw updateError;
        }

        console.log('✅ CRITICAL: Tokens almacenados exitosamente para usuario original');

        // Limpiar sessionStorage
        sessionStorage.removeItem('original_user_id');
        sessionStorage.removeItem('original_user_email');
        sessionStorage.removeItem('analytics_oauth_flow');

        // Redirigir al dashboard
        console.log('✅ CRITICAL: Redirigiendo al dashboard con sesión original intacta');
        navigate('/dashboard', { replace: true });
        
      } catch (err) {
        console.error('❌ Error en callback directo de Analytics:', err);
        setError('Error conectando Google Analytics: ' + err.message);
        
        // Limpiar sessionStorage en caso de error
        sessionStorage.removeItem('original_user_id');
        sessionStorage.removeItem('original_user_email');
        sessionStorage.removeItem('analytics_oauth_flow');
        
        setLoading(false);
      }
    };

    // Ejecutar el callback
    handleDirectAnalyticsCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Conectando con Google Analytics...</p>
          <p className="mt-2 text-sm text-gray-500">Preservando tu sesión original</p>
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error de Conexión</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AnalyticsDirectCallback;