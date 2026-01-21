# Solución Error: react-scripts: not found en Coolify

## 🚨 Problema Identificado

El build está fallando con el error:
```
/bin/sh: 1: react-scripts: not found
❌ Error durante el build: Command failed: CI=false react-scripts build
```

## 🔍 Análisis del Error

### ✅ Lo que funciona correctamente:
- **Node.js 20.18.1** se instaló correctamente
- **npm ci** funcionó y instaló 741 paquetes
- **Dependencias** se instalaron sin errores críticos

### ❌ El problema:
- **react-scripts** no se encuentra en el PATH durante el build
- **NODE_ENV=production** está omitiendo devDependencies
- **react-scripts** está en devDependencies, no en dependencies

## 🎯 Causa Principal

El problema es que **NODE_ENV=production** hace que npm omita las devDependencies, pero **react-scripts** está en devDependencies y es necesario para el build.

```
⚠️ Build-time environment variable warning: NODE_ENV=production
Affects: Node.js/npm/yarn/bun/pnpm
Issue: Skips devDependencies installation which are often required for building (webpack, typescript, etc.)
```

## 🔧 Soluciones

### Opción 1: Mover react-scripts a dependencies (Recomendado)

Modifica `package.json`:

```json
{
  "dependencies": {
    "@react-oauth/google": "^0.12.1",
    "@supabase/supabase-js": "^2.38.0",
    "autoprefixer": "^10.4.16",
    "axios": "^1.13.2",
    "chart.js": "^4.5.1",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "exceljs": "^4.4.0",
    "express": "^5.2.1",
    "framer-motion": "^12.23.26",
    "google-auth-library": "^9.4.0",
    "googleapis": "^128.0.0",
    "html2canvas": "^1.4.1",
    "lucide-react": "^0.294.0",
    "postcss": "^8.4.32",
    "pptxgenjs": "^3.12.0",
    "puppeteer": "^24.34.0",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.3.1",
    "react-circular-progressbar": "^2.2.0",
    "react-dom": "^18.2.0",
    "react-intersection-observer": "^10.0.0",
    "react-query": "^3.39.3",
    "react-router-dom": "^6.8.0",
    "react-scripts": "^5.0.1",  // MOVER AQUÍ
    "react-spring": "^10.0.3",
    "recharts": "^2.15.4",
    "source-list-map": "^2.0.1",
    "sweetalert2": "^11.26.17",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@craco/craco": "^7.1.0",
    "buffer": "^6.0.3",
    "concurrently": "^9.2.1",
    "playwright-core": "^1.57.0",
    "process": "^0.11.10"
  }
}
```

### Opción 2: Configurar NODE_ENV para Build

En Coolify, configura las variables de entorno:

**Para Build Time:**
```
NODE_ENV=development
```

**Para Runtime:**
```
NODE_ENV=production
```

### Opción 3: Modificar nixpacks.toml

```toml
[phases.setup]
nixPkgs = ["nodejs_20", "npm-10_x"]

[phases.build]
cmds = ["npm install", "npm run build"]

[phases.install]
cmds = ["npm ci --production=false"]

[start]
cmd = "npm start"

[variables]
NODE_VERSION = "20"
NPM_VERSION = "10"
NIXPACKS_NODE_VERSION = "20"
```

### Opción 4: Usar npm ci con --include=dev

```toml
[phases.build]
cmds = ["npm ci --include=dev", "npm run build"]
```

## 🚀 Solución Inmediata (Recomendada)

### 1. Mover react-scripts a dependencies

```json
"dependencies": {
  // ... otras dependencias
  "react-scripts": "^5.0.1",
  // ... otras dependencias
},
"devDependencies": {
  "@craco/craco": "^7.1.0",
  "buffer": "^6.0.3",
  "concurrently": "^9.2.1",
  "playwright-core": "^1.57.0",
  "process": "^0.11.10"
}
```

### 2. Actualizar nixpacks.toml

```toml
[phases.build]
cmds = ["npm ci", "npm run build"]
```

## 📋 Explicación del Problema

### ¿Qué está pasando?

1. **NODE_ENV=production** le dice a npm que omita devDependencies
2. **react-scripts** está en devDependencies
3. **npm run build** necesita react-scripts para funcionar
4. **Resultado**: react-scripts no está disponible durante el build

### ¿Por qué react-scripts está en devDependencies?

Históricamente, create-react-app pone react-scripts en devDependencies porque:
- No se necesita en producción (runtime)
- Solo se necesita para desarrollo y build
- Reduce el tamaño del bundle de producción

### ¿Por qué esto es un problema en Coolify?

Coolify usa NODE_ENV=production por defecto en el build, lo que causa que las herramientas de build no estén disponibles.

## 🔍 Verificación

Después de aplicar la solución:

1. **Verifica package.json**:
   ```bash
   grep -A 5 -B 5 "react-scripts" package.json
   ```

2. **Prueba localmente**:
   ```bash
   npm install
   npm run build
   ```

3. **Redeploy en Coolify**

## 📊 Advertencias de Node.js

También hay advertencias sobre la versión de Node.js:

```
npm warn EBADENGINE Unsupported engine {
  npm warn EBADENGINE   package: '@react-native/assets-registry@0.83.1',
  npm warn EBADENGINE   required: { node: '>= 20.19.4' },
  npm warn EBADENGINE   current: { node: 'v20.18.1', npm: '10.8.2' }
}
```

Estos son paquetes de React Native que no se usan en tu proyecto React web. Puedes ignorarlos o eliminarlos.

## 🎯 Solución Completa

### 1. Actualizar package.json
Mueve react-scripts a dependencies

### 2. Limpiar dependencias no usadas
Opcional: elimina paquetes @react-native si no se usan

### 3. Actualizar nixpacks.toml
Asegura que use npm ci sin omitir devDependencies

### 4. Redeploy
El build debería funcionar correctamente

## 📝 Checklist

- [ ] Mover react-scripts a dependencies en package.json
- [ ] Actualizar nixpacks.toml si es necesario
- [ ] Probar build localmente
- [ ] Redeploy en Coolify
- [ ] Verificar que la aplicación funcione

## 🔄 Alternativa: Usar Vite

Si sigues teniendo problemas, considera migrar de create-react-app a Vite:

```bash
npm install @vitejs/plugin-react vite
```

Pero esto requiere más cambios en la configuración.

## 🚀 Conclusión

El problema es simple: **react-scripts no está disponible durante el build** porque está en devDependencies y NODE_ENV=production las omite.

La solución más fácil es **mover react-scripts a dependencies** para que esté disponible durante el build en producción.