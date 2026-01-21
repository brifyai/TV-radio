# Solución Error Nixpacks Node.js en Coolify

## Error Identificado

El error en el despliegue de Coolify es causado por un problema con la versión de Node.js en Nixpacks:

```
error: undefined variable 'nodejs-22_x'
at /app/.nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9630efd7e7.nix:19:9
```

## Causa del Problema

1. **Nixpacks está intentando usar Node.js 22** pero la variable `nodejs-22_x` no está definida
2. **Advertencia previa**: `⚠️ NIXPACKS_NODE_VERSION not set. Nixpacks will use Node.js 18 by default, which is EOL.`
3. **Conflicto de versiones**: El sistema intenta usar Node.js 22 pero no encuentra la variable correcta

## Soluciones

### Opción 1: Configurar Variable de Entorno (Recomendado)

En Coolify, agrega esta variable de entorno:

```
NIXPACKS_NODE_VERSION=20
```

**Pasos:**
1. Ve a tu aplicación en Coolify
2. Settings > Environment Variables
3. Agrega: `NIXPACKS_NODE_VERSION=20`
4. Guarda y redeploy

### Opción 2: Usar nixpacks.toml Personalizado

Crea o modifica el archivo `nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["nodejs_20", "npm-10_x"]

[phases.build]
cmds = ["npm install", "npm run build"]

[start]
cmd = "npm start"
```

### Opción 3: Forzar Node.js 20 (Alternativa)

Variable de entorno:
```
NIXPACKS_NODE_VERSION=20
NODE_VERSION=20
```

### Opción 4: Dockerfile Personalizado

Si las opciones anteriores no funcionan, crea un `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Y modifica el `.dockerignore`:
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
.coverage/
```

## Verificación de Versiones Compatible

### Versiones Recomendadas:
- ✅ **Node.js 20** (LTS estable)
- ✅ **Node.js 18** (LTS pero EOL pronto)
- ❌ **Node.js 22** (Problemas con Nixpacks actual)

### Compatibilidad con el Proyecto:

Revisa tu `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

Si no tienes `engines`, agrégalo:

```json
{
  "engines": {
    "node": "20.x",
    "npm": "10.x"
  }
}
```

## Pasos para Solucionar

### 1. Solución Rápida (Variables de Entorno)

En Coolify:
```
NIXPACKS_NODE_VERSION=20
NODE_VERSION=20
```

### 2. Solución Media (nixpacks.toml)

Crea `nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ["nodejs_20", "npm-10_x"]

[variables]
NODE_VERSION = "20"
NPM_VERSION = "10"
```

### 3. Solución Definitiva (Dockerfile)

Si nada funciona, usa Dockerfile personalizado.

## Comandos Útiles

### Para verificar versión de Node:
```bash
node --version
npm --version
```

### Para limpiar caché de Nixpacks:
```bash
rm -rf .nixpacks/
```

### Para probar localmente:
```bash
docker build -t test-app .
docker run -p 3000:3000 test-app
```

## Advertencias del Error

### Warning Encontrado:
```
UndefinedVar: Usage of undefined variable '$NIXPACKS_PATH'
```

Esto indica que hay variables sin definir en el Dockerfile generado.

## Recomendación Final

**Usa la Opción 1** primero (variables de entorno):
1. `NIXPACKS_NODE_VERSION=20`
2. `NODE_VERSION=20`

Si no funciona, pasa a la **Opción 2** (nixpacks.toml).

## Verificación Post-Solución

Después de aplicar la solución:

1. **Redeploy en Coolify**
2. **Verifica que el build complete exitosamente**
3. **Prueba la aplicación en producción**
4. **Revisa los logs para confirmar Node.js 20**

## Archivos Modificados Necesarios

Si necesitas crear archivos:

1. `nixpacks.toml` (opción 2)
2. `Dockerfile` (opción 3)
3. Actualizar `package.json` con engines

## Contexto del Error

El error ocurre porque:
- Nixpacks generó un archivo nix temporal
- Intentó usar `nodejs-22_x` que no existe
- La sintaxis correcta sería `nodejs_22` (con guion bajo)
- Pero Node.js 22 puede tener problemas de compatibilidad

Por eso es más seguro usar Node.js 20 que es LTS estable y bien soportado.