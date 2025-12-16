import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import { 
  Globe, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  Database,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';

const Properties = () => {
  const { accountId } = useParams();
  const { 
    accounts, 
    properties, 
    loading, 
    error, 
    loadAccountsAndProperties,
    isConnected 
  } = useGoogleAnalytics();

  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Find the current account
  const currentAccount = accounts.find(account => account.id === accountId);

  // Filter properties for this account
  const accountProperties = properties.filter(property => property.accountId === accountId);

  // Filter properties based on search and type
  const filteredProperties = accountProperties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || property.type === filterType;
    return matchesSearch && matchesFilter;
  });

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

  // Get unique property types for filter
  const propertyTypes = [...new Set(accountProperties.map(p => p.type))];

  if (loading && accountProperties.length === 0) {
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
          Conecta tu cuenta de Google Analytics para ver tus propiedades.
        </p>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Cuenta no encontrada
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          La cuenta especificada no existe o no tienes acceso a ella.
        </p>
        <div className="mt-6">
          <Link
            to="/accounts"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a cuentas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link
            to="/accounts"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a cuentas
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Propiedades - {currentAccount?.displayName || currentAccount?.name}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Gestiona las propiedades de Google Analytics 4
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Buscar propiedades..."
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">Todos los tipos</option>
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {accountProperties.length === 0 
              ? 'No hay propiedades en esta cuenta'
              : 'No se encontraron propiedades'
            }
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {accountProperties.length === 0
              ? 'Esta cuenta no tiene propiedades de Google Analytics configuradas.'
              : 'Intenta cambiar los filtros de búsqueda.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Globe className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate max-w-xs">
                        {property.displayName || property.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {property.type}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {property.type}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nombre de Propiedad</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {property.displayName || property.name}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">ID de Propiedad</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                      {property.id}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Cuenta</dt>
                    <dd className="mt-1 text-sm text-gray-900">{currentAccount?.displayName || currentAccount?.name}</dd>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  <Link
                    to={`/analytics/${property.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Ver Analytics
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {accountProperties.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Resumen de Propiedades
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Globe className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-blue-600 truncate">
                        Total Propiedades
                      </dt>
                      <dd className="text-lg font-medium text-blue-900">
                        {accountProperties.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Search className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-green-600 truncate">
                        Filtradas
                      </dt>
                      <dd className="text-lg font-medium text-green-900">
                        {filteredProperties.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Filter className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-purple-600 truncate">
                        Tipos Únicos
                      </dt>
                      <dd className="text-lg font-medium text-purple-900">
                        {propertyTypes.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Database className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-orange-600 truncate">
                        Cuenta
                      </dt>
                      <dd className="text-lg font-medium text-orange-900 truncate">
                        {currentAccount?.displayName || currentAccount?.name}
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

export default Properties;