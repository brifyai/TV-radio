import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Sparkles, 
  ArrowRight, 
  Play, 
  TrendingUp, 
  Radio,
  Shield,
  Zap,
  CheckCircle,
  Star,
  Users,
  Target,
  Clock
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: 'Análisis TV-Web',
      description: 'Correlación en tiempo real entre transmisiones de TV y tráfico web',
      color: 'text-blue-500'
    },
    {
      icon: Radio,
      title: 'Análisis Radio-Web',
      description: 'Mide el impacto de spots de radio en el comportamiento online',
      color: 'text-purple-500'
    },
    {
      icon: Zap,
      title: 'Insights IA',
      description: 'Recomendaciones inteligentes basadas en machine learning',
      color: 'text-yellow-500'
    },
    {
      icon: Shield,
      title: 'Datos Seguros',
      description: 'Protección garantizada de tu información y métricas',
      color: 'text-green-500'
    }
  ];

  const stats = [
    { number: '98%', label: 'Precisión en predicciones' },
    { number: '50+', label: 'Canales analizados' },
    { number: '24/7', label: 'Monitoreo continuo' },
    { number: '10K+', label: 'Spots procesados' }
  ];

  const testimonials = [
    {
      name: 'María González',
      role: 'Directora de Marketing',
      company: 'TechCorp',
      content: 'iMetrics revolucionó nuestra estrategia de medios. Ahora sabemos exactamente qué spots generan más tráfico web.',
      rating: 5
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Analista Digital',
      company: 'MediaPro',
      content: 'Las recomendaciones de timing han aumentado nuestro ROI en un 40%. Increíble herramienta.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">iMetrics</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Características</a>
            <a href="#stats" className="text-slate-300 hover:text-white transition-colors">Estadísticas</a>
            <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">Testimonios</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                  <Sparkles className="h-4 w-4 text-yellow-400 mr-2" />
                  <span className="text-sm text-slate-200">Análisis Inteligente de Métricas</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Transforma tus datos en 
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> insights accionables</span>
                </h1>
                
                <p className="text-xl text-slate-300 mb-8 max-w-2xl">
                  Analiza la correlación entre TV, Radio y tráfico web con métricas en tiempo real. 
                  Optimiza tus campañas con inteligencia artificial.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <span>Comenzar Gratis</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 backdrop-blur-sm flex items-center justify-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>Ver Demo</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                {/* Dashboard Mockup */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Dashboard en Tiempo Real</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300 text-sm">Correlación TV-Web</span>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">+127%</div>
                      <div className="text-xs text-green-400">↑ 23% vs ayer</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300 text-sm">Spots Analizados</span>
                        <Radio className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">1,247</div>
                      <div className="text-xs text-blue-400">Esta semana</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300 text-sm">Precisión IA</span>
                        <Zap className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">98.7%</div>
                      <div className="text-xs text-yellow-400">Última actualización</div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3 shadow-lg"
                >
                  <Sparkles className="h-6 w-6 text-white" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-3 shadow-lg"
                >
                  <BarChart3 className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Todo lo que necesitas para analizar y optimizar tus campañas de medios
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Resultados que Hablan por Sí Solos
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Lo que Dicen Nuestros Clientes
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-slate-400">{testimonial.role} en {testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Listo para Transformar tu Estrategia de Medios?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Únete a cientos de empresas que ya están optimizando sus campañas con iMetrics
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Comenzar Ahora</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                Contactar Ventas
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">iMetrics</span>
            </div>
            
            <div className="text-slate-400 text-sm">
              © 2024 iMetrics. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;