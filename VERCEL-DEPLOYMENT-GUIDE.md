# 🚀 Guía Completa: Deploy en Vercel con Google Sheets

## 📋 Lo que vas a lograr:

1. ✅ App funcionando en Vercel (con tu propio link)
2. ✅ Conectada a tu Google Sheet en tiempo real
3. ✅ Tú y Ronald pueden actualizar desde sus celulares
4. ✅ Gráfico animado que muestra el progreso
5. ✅ Todos los datos sincronizados automáticamente

---

## 🎯 PASO 1: Preparar tu Google Sheet

### 1.1 Hacer el Sheet Público (Solo Lectura)

1. Abre tu Google Sheet: https://docs.google.com/spreadsheets/d/1iedte5JfA9cN6rZjVy1T41s9lU-4IVq7Sxm-MsuM1ig
2. Click en **"Compartir"** (arriba derecha)
3. Click en **"Cambiar a cualquier persona con el enlace"**
4. Selecciona **"Lector"** (no "Editor")
5. Click **"Copiar enlace"**
6. Click **"Listo"**

**¿Por qué?** Para que la app pueda leer los datos sin necesitar login.

### 1.2 Obtener Google API Key

1. Ve a: https://console.cloud.google.com/
2. Click **"Crear Proyecto"** (arriba)
3. Nombre: "Shai vs Ronald"
4. Click **"Crear"**
5. Espera 30 segundos
6. En el menú lateral: **"APIs y servicios" → "Biblioteca"**
7. Busca: **"Google Sheets API"**
8. Click en **"Google Sheets API"**
9. Click **"HABILITAR"**
10. Espera 10 segundos
11. En el menú lateral: **"APIs y servicios" → "Credenciales"**
12. Click **"CREAR CREDENCIALES"**
13. Selecciona **"Clave de API"**
14. **COPIA LA API KEY** que te dan (es algo como: `AIzaSyC...`)
15. Click **"RESTRINGIR CLAVE"**
16. En "Restricciones de API":
    - Selecciona **"Restringir clave"**
    - Marca SOLO **"Google Sheets API"**
17. Click **"GUARDAR"**

**Guarda esta API Key** - la vas a necesitar en el Paso 3.

---

## 🎯 PASO 2: Preparar los Archivos

### 2.1 Crear la estructura de carpetas

En tu computadora, crea una carpeta llamada `shai-vs-ronald`:

```
shai-vs-ronald/
├── package.json
├── vercel.json
├── public/
│   └── index.html
└── src/
    └── App.jsx
```

### 2.2 Crear `package.json`

Crea un archivo `package.json` con este contenido:

```json
{
  "name": "shai-vs-ronald",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9"
  }
}
```

### 2.3 Crear `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### 2.4 Crear `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### 2.5 Crear `public/index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shai vs. Ronald</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

### 2.6 Crear `src/main.jsx`

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 2.7 Copiar `src/App.jsx`

Copia el archivo `shai-vs-ronald-graph.jsx` que te di y renómbralo a `src/App.jsx`.

**IMPORTANTE**: En la parte superior del archivo, actualiza esta línea:

```javascript
const SHEET_CONFIG = {
  SHEET_ID: '1iedte5JfA9cN6rZjVy1T41s9lU-4IVq7Sxm-MsuM1ig',
  API_KEY: 'TU_API_KEY_AQUI' // <- Pega tu API Key aquí
};
```

---

## 🎯 PASO 3: Subir a GitHub

### 3.1 Instalar Git (si no lo tienes)

**Mac/Linux:**
```bash
# Ya viene instalado
git --version
```

**Windows:**
Descarga de: https://git-scm.com/download/win

### 3.2 Crear repositorio en GitHub

1. Ve a: https://github.com
2. Click **"New"** (arriba izquierda)
3. Nombre: `shai-vs-ronald`
4. Selecciona **"Private"** (para que solo tú lo veas)
5. Click **"Create repository"**

### 3.3 Subir tu código

En la terminal (dentro de tu carpeta `shai-vs-ronald`):

```bash
# Inicializar git
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit"

# Conectar con GitHub (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/shai-vs-ronald.git

# Subir a GitHub
git push -u origin main
```

---

## 🎯 PASO 4: Deployar en Vercel

### 4.1 Crear cuenta en Vercel

1. Ve a: https://vercel.com
2. Click **"Sign Up"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza Vercel

### 4.2 Importar tu proyecto

1. En el dashboard de Vercel, click **"Add New..." → "Project"**
2. Busca tu repositorio **"shai-vs-ronald"**
3. Click **"Import"**
4. **NO CAMBIES NADA** en la configuración
5. Click **"Deploy"**
6. Espera 2-3 minutos

### 4.3 ¡Listo!

Vercel te dará un link como: `https://shai-vs-ronald.vercel.app`

**¡Ese es tu link!** Compártelo con Ronald y ambos pueden usarlo desde sus celulares.

---

## 📱 PASO 5: Configurar para Celular

### 5.1 Guardar en Pantalla de Inicio (iPhone)

1. Abre el link en Safari
2. Tap el botón de compartir (cuadro con flecha)
3. Scroll hacia abajo
4. Tap **"Agregar a pantalla de inicio"**
5. Tap **"Agregar"**

¡Ahora tienes un ícono como si fuera una app!

### 5.2 Guardar en Pantalla de Inicio (Android)

1. Abre el link en Chrome
2. Tap los tres puntos (arriba derecha)
3. Tap **"Agregar a pantalla de inicio"**
4. Tap **"Agregar"**

---

## 🔄 CÓMO FUNCIONA

### Para Leer del Google Sheet:

La app lee automáticamente del Sheet cada vez que alguien abre la página.

### Para Escribir al Google Sheet:

**OPCIÓN A: Automático con Google Sheets API (Requiere Backend)**

Para que los cambios se guarden automáticamente en el Sheet, necesitas un backend. Puedo ayudarte a configurar esto, pero requiere:
- Vercel Serverless Functions
- Google Service Account
- 30 minutos más de setup

**OPCIÓN B: Manual (MÁS FÁCIL - RECOMENDADO)**

1. Cuando agreguen puntos en la app, se guardan localmente
2. Al final de la semana, uno de ustedes actualiza el Google Sheet manualmente
3. La próxima vez que abran la app, verán los datos actualizados

**OPCIÓN C: Firebase (LA MEJOR)**

En lugar de Google Sheets, usa Firebase Realtime Database:
- ✅ Sincronización automática en tiempo real
- ✅ Gratis hasta 1GB
- ✅ Más rápido que Google Sheets
- ✅ 15 minutos de setup

---

## 🎨 PERSONALIZAR

### Cambiar Colores

En `src/App.jsx`, busca estas líneas y cambia los colores:

```javascript
// Color de Shai (morado)
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// Color de Ronald (rosa)
background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
```

### Cambiar Nombres

Busca `'Shai'` y `'Ronald'` y reemplázalos.

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### "No puedo leer el Google Sheet"

**Causa:** El Sheet no es público o la API Key está mal.

**Solución:**
1. Verifica que el Sheet esté en modo "Cualquiera con el enlace puede ver"
2. Verifica que copiaste la API Key correctamente
3. Verifica que habilitaste "Google Sheets API"

### "Vercel no está haciendo build"

**Causa:** Falta algún archivo o hay un error de sintaxis.

**Solución:**
1. Revisa que todos los archivos estén en el lugar correcto
2. En Vercel, ve a "Deployments" → Click en el deployment fallido → Ve "Build Logs"
3. Copia el error y pregúntame

### "Los datos no se sincronizan entre dispositivos"

**Causa:** Estás usando almacenamiento local (navegador) en lugar de una base de datos.

**Solución:** Necesitas implementar Firebase (Opción C). Dime y te ayudo.

---

## 🚀 SIGUIENTE NIVEL: Firebase (Recomendado)

Si quieres sincronización automática en tiempo real entre todos los dispositivos:

### Ventajas de Firebase:
- ✅ Cambios se ven instantáneamente en todos los celulares
- ✅ No necesitas actualizar el Sheet manualmente
- ✅ Más rápido y confiable
- ✅ Gratis para tu volumen de datos
- ✅ Backup automático

### ¿Te interesa?

Solo dime: **"Configura Firebase"** y te hago todo el setup paso a paso con código listo.

---

## 📊 RESUMEN

```
1. Google Sheet público ✅
2. Google API Key ✅
3. Código en GitHub ✅
4. Deploy en Vercel ✅
5. Link compartido con Ronald ✅
6. App en pantalla de inicio ✅
```

**Tu link será:** `https://shai-vs-ronald.vercel.app`

¡Disfruten su competencia! 🏆
