import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import {
  BarChart3,
  Users,
  Database,
  TrendingUp,
  Plus,
  ExternalLink,
  Globe
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const {
    accounts,
    properties,
    isConnected,
    loading,
    error,
    errorType,
    connectGoogleAnalytics,
    loadAccountsAndProperties,
    clearError
  } = useGoogleAnalytics();

  // Load accounts immediately when component mounts, properties in background
  React.useEffect(() => {
    if (isConnected && accounts.length === 0) {
      loadAccountsAndProperties(true); // Load accounts first, properties in background
    }
  }, [isConnected, accounts.length, loadAccountsAndProperties]);

  const handleConnectGoogleAnalytics = async () => {
    try {
      await connectGoogleAnalytics();
    } catch (err) {
      console.error('Error iniciando conexión con Google Analytics:', err);
    }
  };

  // Show loading only for initial connection, not for property loading
  const showLoading = loading && accounts.length === 0 && !isConnected;

  const stats = [
    {
      name: 'Cuentas Conectadas',
      value: accounts.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/accounts'
    },
    {
      name: 'Propiedades',
      value: properties.length,
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/accounts',
      loading: loading && accounts.length > 0 && properties.length === 0 // Show loading state for properties
    },
    {
      name: 'Estado Conexión',
      value: isConnected ? 'Conectado' : 'Desconectado',
      icon: Database,
      color: isConnected ? 'text-green-600' : 'text-red-600',
      bgColor: isConnected ? 'bg-green-50' : 'bg-red-50',
      href: null
    }
  ];

  if (showLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bienvenido, {user?.user_metadata?.full_name || user?.email || 'Usuario'}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Gestiona tus cuentas y propiedades de Google Analytics 4
              </p>
            </div>
            <div className="flex-shrink-0">
              <BarChart3 className="h-12 w-12 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <Database className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Conecta tu cuenta de Google Analytics
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Para ver tus datos de Google Analytics 4, necesitas conectar tu cuenta de Google.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleConnectGoogleAnalytics}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Conectar Google Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      <ErrorMessage
        error={error}
        errorType={errorType}
        onDismiss={clearError}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${item.bgColor}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {item.loading ? (
                        <div className="flex items-center">
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Cargando...</span>
                        </div>
                      ) : item.href ? (
                        <Link
                          to={item.href}
                          className="hover:text-primary-600 transition-colors duration-200"
                        >
                          {item.value}
                        </Link>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          
          {accounts.length === 0 ? (
            <div className="text-center py-6">
              <Database className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay cuentas conectadas
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Conecta tu cuenta de Google Analytics para empezar.
              </p>
              {!isConnected && (
                <div className="mt-6">
                  <button
                    onClick={handleConnectGoogleAnalytics}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Conectar Google Analytics
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.slice(0, 3).map((account) => {
                const accountProperties = properties.filter(p => p.accountId === account.id);
                return (
                  <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-8 w-8 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {account.displayName || account.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {loading ? 'Cargando propiedades...' : (
                            <>
                              {accountProperties.length} propiedades
                              {accountProperties.length > 0 && (
                                <span className="ml-2 text-xs text-gray-400">
                                  ({accountProperties.slice(0, 2).map(p => p.displayName || p.name).join(', ')}
                                  {accountProperties.length > 2 && ` +${accountProperties.length - 2} más`})
                                </span>
                              )}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/accounts`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                      >
                        Ver propiedades
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
              
              {accounts.length > 3 && (
                <div className="text-center">
                  <Link
                    to="/accounts"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Ver todas las cuentas ({accounts.length})
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              to="/accounts"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 hover:bg-gray-50 rounded-lg border border-gray-200"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-600 ring-4 ring-white">
                  <Users className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Gestionar Cuentas
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Ver y gestionar tus cuentas de Google Analytics
                </p>
              </div>
            </Link>

            <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 hover:bg-gray-50 rounded-lg border border-gray-200 opacity-50">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-gray-50 text-gray-400 ring-4 ring-white">
                  <TrendingUp className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-400">
                  Ver Analytics
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Selecciona una propiedad para ver datos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;