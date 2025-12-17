import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleAnalytics } from '../../contexts/GoogleAnalyticsContext';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { isConnected, disconnectGoogleAnalytics } = useGoogleAnalytics();
  
  // Estados para configuraciones
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Estados para configuraciones de usuario
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    bio: ''
  });

  // Estados para configuraciones de notificaciones
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    analytics: true,
    reports: true,
    maintenance: true
  });

  // Estados para configuraciones de apariencia
  const [appearance, setAppearance] = useState({
    theme: 'system', // light, dark, system
    language: 'es',
    timezone: 'America/Santiago',
    dateFormat: 'DD/MM/YYYY',
    currency: 'CLP'
  });

  // Estados para configuraciones de privacidad
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    analyticsSharing: false,
    dataRetention: '1year',
    twoFactorAuth: false
  });

  // Estados para configuraciones de datos
  const [dataSettings, setDataSettings] = useState({
    autoBackup: true,
    dataExport: false,
    clearCache: false,
    resetSettings: false
  });

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'appearance', name: 'Apariencia', icon: Palette },
    { id: 'privacy', name: 'Privacidad', icon: Shield },
    { id: 'data', name: 'Datos', icon: Download }
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectAnalytics = async () => {
    if (window.confirm('¿Estás seguro de que quieres desconectar Google Analytics?')) {
      try {
        await disconnectGoogleAnalytics();
        alert('Google Analytics desconectado exitosamente');
      } catch (error) {
        console.error('Error disconnecting:', error);
        alert('Error al desconectar Google Analytics');
      }
    }
  };

  const renderProfileSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Avatar Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
        
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1.5 hover:bg-blue-600 transition-colors">
              <Upload className="h-3 w-3" />
            </button>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{profileData.fullName || 'Sin nombre'}</h4>
            <p className="text-sm text-gray-500">{profileData.email}</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 mt-1">
              Cambiar foto de perfil
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              value={profileData.fullName}
              onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu nombre completo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+56 9 XXXX XXXX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa
            </label>
            <input
              type="text"
              value={profileData.company}
              onChange={(e) => setProfileData({...profileData, company: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre de tu empresa"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biografía
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Cuéntanos sobre ti..."
            />
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seguridad de la Cuenta</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Lock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Contraseña</p>
                <p className="text-sm text-gray-500">Última actualización: hace 30 días</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Cambiar
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Autenticación de dos factores</p>
                <p className="text-sm text-gray-500">Añade una capa extra de seguridad</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.twoFactorAuth}
                onChange={(e) => setPrivacy({...privacy, twoFactorAuth: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Google Analytics Connection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conexiones</h3>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Google Analytics</p>
              <p className="text-sm text-gray-500">
                {isConnected ? 'Conectado y funcionando' : 'No conectado'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {isConnected && (
              <button
                onClick={handleDisconnectAnalytics}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Desconectar
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderNotificationSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Preferencias de Notificaciones</h3>
        
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Notificaciones por email', desc: 'Recibe actualizaciones importantes por correo' },
            { key: 'push', label: 'Notificaciones push', desc: 'Recibe notificaciones en tiempo real' },
            { key: 'analytics', label: 'Reportes de Analytics', desc: 'Resumen semanal de métricas importantes' },
            { key: 'reports', label: 'Reportes personalizados', desc: 'Alertas sobre cambios significativos' },
            { key: 'maintenance', label: 'Mantenimiento del sistema', desc: 'Notificaciones sobre actualizaciones' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) => setNotifications({...notifications, [item.key]: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderAppearanceSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Personalización</h3>
        
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tema de color
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Claro', icon: Sun },
                { value: 'dark', label: 'Oscuro', icon: Moon },
                { value: 'system', label: 'Sistema', icon: Monitor }
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => setAppearance({...appearance, theme: theme.value})}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                    appearance.theme === theme.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <theme.icon className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma
            </label>
            <select
              value={appearance.language}
              onChange={(e) => setAppearance({...appearance, language: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona horaria
            </label>
            <select
              value={appearance.timezone}
              onChange={(e) => setAppearance({...appearance, timezone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="America/Santiago">Santiago (UTC-3)</option>
              <option value="America/Buenos_Aires">Buenos Aires (UTC-3)</option>
              <option value="America/Lima">Lima (UTC-5)</option>
              <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato de fecha
            </label>
            <select
              value={appearance.dateFormat}
              onChange={(e) => setAppearance({...appearance, dateFormat: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda
            </label>
            <select
              value={appearance.currency}
              onChange={(e) => setAppearance({...appearance, currency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="CLP">Peso Chileno (CLP)</option>
              <option value="USD">Dólar Americano (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="ARS">Peso Argentino (ARS)</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderPrivacySettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración de Privacidad</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Visibilidad del perfil</p>
              <p className="text-sm text-gray-500">Controla quién puede ver tu información</p>
            </div>
            <select
              value={privacy.profileVisibility}
              onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="private">Privado</option>
              <option value="team">Solo equipo</option>
              <option value="public">Público</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Compartir datos de Analytics</p>
              <p className="text-sm text-gray-500">Ayuda a mejorar el servicio compartiendo datos anónimos</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.analyticsSharing}
                onChange={(e) => setPrivacy({...privacy, analyticsSharing: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Retención de datos</p>
              <p className="text-sm text-gray-500">Tiempo que se mantienen tus datos</p>
            </div>
            <select
              value={privacy.dataRetention}
              onChange={(e) => setPrivacy({...privacy, dataRetention: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="6months">6 meses</option>
              <option value="1year">1 año</option>
              <option value="2years">2 años</option>
              <option value="indefinite">Indefinido</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderDataSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Gestión de Datos</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Download className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Backup automático</p>
                <p className="text-sm text-gray-500">Respalda tus datos automáticamente</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dataSettings.autoBackup}
                onChange={(e) => setDataSettings({...dataSettings, autoBackup: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Upload className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Exportar datos</p>
                <p className="text-sm text-gray-500">Descarga una copia de todos tus datos</p>
              </div>
            </div>
            <button
              onClick={() => setDataSettings({...dataSettings, dataExport: true})}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Exportar
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">Limpiar caché</p>
                <p className="text-sm text-yellow-700">Elimina archivos temporales para mejorar el rendimiento</p>
              </div>
            </div>
            <button
              onClick={() => setDataSettings({...dataSettings, clearCache: true})}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Limpiar
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Trash2 className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Restablecer configuración</p>
                <p className="text-sm text-red-700">Vuelve a la configuración predeterminada</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
                  setDataSettings({...dataSettings, resetSettings: true});
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Restablecer
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'data':
        return renderDataSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-2 text-gray-600">
            Personaliza tu experiencia y gestiona tus preferencias
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="mr-3 h-5 w-5" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
            
            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={loading}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  saved
                    ? 'bg-green-600 text-white'
                    : loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {saved ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Guardado
                  </>
                ) : loading ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Guardar cambios
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;