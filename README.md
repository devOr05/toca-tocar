# Toca Tocar 🎷

**Organizador de Jams de Jazz en Tiempo Real**

[![Version](https://img.shields.io/badge/version-0.1.0--beta-blue.svg)](https://github.com/yourusername/toca-tocar)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎵 Descripción

Toca Tocar es una plataforma web para organizar y participar en jams de jazz. Permite a músicos crear sesiones, proponer temas, unirse con sus instrumentos y chatear en tiempo real.

## ✨ Características Principales

### Autenticación
- 🔐 Login con Google OAuth
- 👤 Modo Invitado (sin registro)
- 📝 Perfiles de usuario con ciudad e instrumento principal

### Gestión de Jams
- 🎺 Crear jams públicas o privadas
- 📍 Ubicación y fecha/hora
- 🔗 Códigos únicos para compartir
- ✏️ Edición de detalles del jam

### Temas Musicales
- 🎼 Proponer canciones y tópicos de discusión
- 📄 Agregar partituras (URLs)
- 🎹 Especificar tonalidad
- 👥 Sistema de participación con instrumentos
- 📊 Estados: OPEN, QUEUED, PLAYING, FINISHED

### Chat
- 💬 Chat general del jam
- 🎵 Chat por tema musical
- 📢 Chat por tópico de discusión

### Dashboard
- 📋 Lista de todos los jams activos
- 🎷 Músicos cercanos (por ciudad)
- 🔍 Vista de participantes por jam

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **UI:** React 19, Tailwind CSS v4
- **Base de Datos:** PostgreSQL (Vercel Postgres) / SQLite (local)
- **ORM:** Prisma 5.10.2
- **Autenticación:** NextAuth.js v5
- **State Management:** Zustand
- **Icons:** Lucide React
- **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisitos

- Node.js 20+
- npm/yarn/pnpm
- PostgreSQL (producción) o SQLite (desarrollo)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/yourusername/toca-tocar.git
cd toca-tocar
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz:

```env
# Database
DATABASE_URL="file:./dev.db"  # SQLite local
# DATABASE_URL="postgresql://..." # PostgreSQL producción

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opcional para desarrollo)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Inicializar base de datos**
```bash
npx prisma generate
npx prisma db push
```

5. **Ejecutar servidor de desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/auth/          # NextAuth routes
│   ├── create-jam/        # Crear jam
│   ├── dashboard/         # Dashboard principal
│   ├── jam/[code]/        # Vista de jam
│   ├── profile/           # Perfil de usuario
│   └── actions.ts         # Server actions
├── components/            # Componentes React
├── lib/                   # Utilidades
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── auth.ts               # Configuración NextAuth
```

## 🎯 Roadmap

### v0.1.0-beta (Actual)
- [x] Autenticación con Google y modo invitado
- [x] CRUD de jams y temas
- [x] Sistema de participación
- [x] Chat básico
- [x] Dashboard con músicos cercanos

### v0.2.0 (Próximo)
- [ ] Chat en tiempo real (WebSocket/Pusher)
- [ ] Búsqueda y filtros
- [ ] Notificaciones
- [ ] Subida de archivos (partituras)
- [ ] Panel de administración

### v1.0.0 (Futuro)
- [ ] Video/audio integración
- [ ] Sistema de ratings
- [ ] Historial de jams
- [ ] App móvil

## 🐛 Known Issues

- Chat requiere refresh manual (no real-time)
- Lint warnings menores (imports no usados)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Autores

- **Tu Nombre** - *Trabajo Inicial* - [YourGitHub](https://github.com/yourusername)

## 🙏 Agradecimientos

- Comunidad de jazz local
- Next.js team
- Vercel

---

**Hecho con ❤️ para la comunidad jazzística**
