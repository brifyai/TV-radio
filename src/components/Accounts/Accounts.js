import React, { useState } from 'react';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import {
  Users,
  Globe,
  ExternalLink,
  RefreshCw,
  Database,
  TrendingUp,
  Calendar
} from 'lucide-react';

const Accounts = () => {
  const {
    accounts,
    properties,
    loading,
    error,
    errorType,
    loadAccountsAndProperties,
    isConnected,
    clearError
  } = useGoogleAnalytics();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAccountsAndProperties();
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Group properties by account - Optimized version
  // Create a map for O(1) lookup instead of O(n) filtering
  const propertiesByAccount = React.useMemo(() => {
    const map = new Map();
    properties.forEach(property => {
      const accountId = property.accountId;
      if (!map.has(accountId)) {
        map.set(accountId, []);
      }
      map.get(accountId).push(property);
    });
    return map;
  }, [properties]);

  const accountsWithProperties = React.useMemo(() => {
    return accounts.map(account => ({
      ...account,
      accountProperties: propertiesByAccount.get(account.id) || []
    }));
  }, [accounts, propertiesByAccount]);

  // Debug logging solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 DEBUG: Total de cuentas: ${accounts.length}, Total de propiedades: ${properties.length}`);
    console.log(`🔍 DEBUG: Resumen de propiedades por cuenta:`,
      accountsWithProperties.map(a => ({ id: a.id, name: a.displayName, count: a.accountProperties.length }))
    );
  }

  // Show loading only for initial connection, not for property loading
  const showLoading = loading && accounts.length === 0 && !isConnected;

  if (showLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Database className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No hay conexión con Google Analytics
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Conecta tu cuenta de Google Analytics para ver tus cuentas y propiedades.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cuentas de Google Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona tus cuentas y propiedades de Google Analytics 4
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Error Display */}
      <ErrorMessage
        error={error}
        errorType={errorType}
        onDismiss={clearError}
      />

      {/* Accounts Grid */}
      {accountsWithProperties.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay cuentas disponibles
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isConnected 
              ? 'No se encontraron cuentas de Google Analytics para tu cuenta.'
              : 'Conecta tu cuenta de Google Analytics para ver tus cuentas.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {accountsWithProperties.map((account) => (
            <div key={account.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {account.displayName || account.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {account.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {loading && accounts.length > 0 ? (
                        <div className="flex items-center">
                          <LoadingSpinner size="sm" />
                          <span className="ml-1">Cargando...</span>
                        </div>
                      ) : (
                        `${account.accountProperties.length} propiedades`
                      )}
                    </span>
                  </div>
                </div>

                {/* Properties List */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Propiedades ({account.accountProperties.length})
                  </h4>
                  
                  {loading && accounts.length > 0 ? (
                    <div className="flex items-center justify-center py-4">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2 text-sm text-gray-500">Cargando propiedades...</span>
                    </div>
                  ) : account.accountProperties.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No hay propiedades en esta cuenta
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {account.accountProperties.map((property) => (
                        <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <Globe className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {property.displayName || property.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {property.type} • ID: {property.id}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/analytics/${property.id}`}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                            >
                              Ver datos
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end">
                  <Link
                    to={`/properties/${account.id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Ver todas las propiedades
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {accountsWithProperties.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Resumen
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-blue-600 truncate">
                        Total Cuentas
                      </dt>
                      <dd className="text-lg font-medium text-blue-900">
                        {accountsWithProperties.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Globe className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-green-600 truncate">
                        Total Propiedades
                      </dt>
                      <dd className="text-lg font-medium text-green-900">
                        {properties.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-purple-600 truncate">
                        Promedio por Cuenta
                      </dt>
                      <dd className="text-lg font-medium text-purple-900">
                        {accountsWithProperties.length > 0 
                          ? Math.round(properties.length / accountsWithProperties.length * 10) / 10
                          : 0
                        }
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;