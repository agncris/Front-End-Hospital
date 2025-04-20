# Hospital Sale Sano

Sistema de gestión hospitalaria desarrollado como Progressive Web App (PWA) con React y Vite.

## Características

- ✨ Interfaz moderna y responsive con Bootstrap 5
- 🔒 Autenticación segura con JWT
- 🏥 Gestión de doctores y pacientes
- 📱 Funcionalidad offline (PWA)
- 🔐 Encriptación de datos sensibles
- 🌐 Sincronización en segundo plano

## Requisitos

- Node.js >= 18
- npm >= 9

## Instalación

1. Clona el repositorio:

```bash
git clone [url-del-repositorio]
cd Front-End-Hospital-Modulo8-tarea2
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

```bash
cp .env.example .env
```

4. Edita el archivo `.env` con tus valores:

```env
VITE_API_KEY=tu_api_key
VITE_ENCRYPTION_KEY=tu_clave_de_encriptacion
```

## Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

## Producción

Construye la aplicación:

```bash
npm run build
```

Previsualiza la versión de producción:

```bash
npm run preview
```

## Estructura del Proyecto

```
Front-End-Hospital/
├── public/           # Archivos estáticos
│   ├── icons/       # Iconos PWA
│   └── sw.js        # Service Worker
├── src/
│   ├── components/  # Componentes React
│   ├── context/     # Contextos (Auth, Doctor)
│   ├── hooks/       # Hooks personalizados
│   └── styles/      # Estilos CSS
└── ...
```

## Seguridad

- Encriptación de datos con CryptoJS
- Sanitización de entrada con DOMPurify
- Headers de seguridad configurados
- Content Security Policy (CSP)
- Autenticación JWT

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación
- `npm run preview`: Previsualiza la versión de producción
- `npm run lint`: Ejecuta el linter

## PWA

La aplicación incluye:

- Manifest para instalación
- Service Worker para offline
- Iconos adaptables
- Notificaciones push
- Sincronización en segundo plano

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
