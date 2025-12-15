# Mi Aplicación - Task Management App

Aplicación móvil de gestión de tareas construida con **React Native/Expo** que se conecta a una API backend en **Hono.js** (Cloudflare Workers).

## 🚀 Características

- ✅ **Autenticación JWT** - Login y registro seguro
- ✅ **Gestión de Tareas** - Crear, editar, eliminar y marcar tareas como completadas
- ✅ **Sincronización en Tiempo Real** - API REST con respuestas instantáneas
- ✅ **Diseño Responsivo** - Interfaz optimizada para dispositivos móviles
- ✅ **Almacenamiento Local** - AsyncStorage para persistencia de tokens
- ✅ **Manejo de Errores Robusto** - Mensajes claros y timeouts configurables

## 📋 Requisitos Previos

- **Node.js** v18+ y npm/yarn
- **Expo CLI** - `npm install -g expo-cli`
- **Android Emulator** o **Expo Go** en teléfono
- **Wrangler** - `npm install -g wrangler` (para el servidor)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/MatiasCastilloCaceres/Mi_aplicacion.git
cd Mi_aplicacion
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# URL de la API del backend
EXPO_PUBLIC_API_URL=http://192.168.1.8:8787
```

**Nota:** Reemplaza `192.168.1.8` con la IP de tu máquina en la red local.

### 4. Iniciar la aplicación

```bash
npx expo start --clear
```

Opciones:
- Presiona `a` para abrir en Android
- Presiona `w` para abrir en web
- Presiona `i` para abrir en iOS (solo macOS)
- O escanea el QR con **Expo Go**

## 🔧 Configuración del Backend

El proyecto requiere un servidor API en Hono.js. Está en un repositorio separado: [`todo-list-hono-api`](https://github.com/MatiasCastilloCaceres/todo-list-hono-api)

### Instalación del servidor

```bash
cd ../todo-list-hono-api
npm install
```

### Crear archivo `.dev.vars`

```env
JWT_SECRET=dev-jwt-secret-change-in-production-min-32-chars
PASSWORD_SALT=dev-password-salt-change-in-production
```

### Iniciar el servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:8787`

## 📁 Estructura del Proyecto

```
Mi_aplicacion/
├── app/                          # Rutas principales (Expo Router)
│   ├── (tabs)/                  # Pantallas con pestañas
│   │   ├── index.tsx            # Inicio
│   │   ├── explore.tsx          # Explorar
│   │   └── tasks.tsx            # Gestión de tareas
│   ├── login.tsx                # Pantalla de login
│   └── _layout.tsx              # Layout principal
├── src/
│   ├── api/
│   │   ├── api.ts               # Servicio de API (auth, tasks)
│   │   └── axios.ts             # Cliente HTTP (fetch wrapper)
│   ├── context/
│   │   └── AuthContext.tsx      # Contexto global de autenticación
│   └── types/
│       └── index.ts             # Tipos TypeScript
├── components/                   # Componentes reutilizables
│   └── TaskForm.tsx             # Formulario para tareas
├── hooks/                        # Hooks personalizados
├── constants/                    # Constantes (temas, config)
├── assets/                       # Imágenes y recursos
└── package.json                  # Dependencias y scripts
```

## 🔑 Credenciales de Prueba

Para probar la aplicación, usa:

- **Email:** `user@example.com`
- **Contraseña:** `password123`

Si el usuario no existe, puedes registrarte desde la pantalla de login.

## 📱 Endpoints de la API

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/login` | Iniciar sesión |

### Tareas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/todos` | Obtener todas las tareas |
| GET | `/todos/:id` | Obtener una tarea específica |
| POST | `/todos` | Crear nueva tarea |
| PATCH | `/todos/:id` | Actualizar tarea (parcial) |
| DELETE | `/todos/:id` | Eliminar tarea |

## 🔐 Autenticación

La aplicación usa **JWT (JSON Web Tokens)** para autenticación:

1. El usuario inicia sesión con email y contraseña
2. El servidor devuelve un token JWT
3. El token se guarda en `AsyncStorage`
4. Cada solicitud incluye el token en el header `Authorization: Bearer <token>`
5. El servidor valida el token para autorizar las operaciones

## 🎨 Interfaz de Usuario

La aplicación usa temas de **Expo** adaptados a modo claro/oscuro:

- Botones personalizados con haptic feedback
- Iconos de símbolo del sistema
- Layout responsivo con SafeAreaView
- Animaciones suaves con Reanimated (si está instalado)

## ⚙️ Tecnologías Utilizadas

### Frontend
- **React Native** - Framework de aplicaciones móviles
- **Expo** - Plataforma de desarrollo
- **TypeScript** - Tipado estático
- **AsyncStorage** - Almacenamiento local persistente
- **Expo Router** - Enrutamiento declarativo

### Backend
- **Hono.js** - Framework web minimalista
- **Cloudflare Workers** - Plataforma de ejecución
- **D1** - Base de datos SQLite
- **Jose** - Librería de JWT

## 🐛 Troubleshooting

### "Network request failed"
- Verifica que el servidor esté corriendo (`npm run dev` en `todo-list-hono-api`)
- Confirma que la IP en `.env.local` es correcta (ejecuta `ipconfig` en Windows)
- Asegúrate que el emulador/dispositivo puede alcanzar esa IP

### "Invalid credentials"
- Verifica que el usuario está registrado en el servidor
- Comprueba que la contraseña es correcta
- Intenta registrarse de nuevo

### "Timeout: La solicitud tardó demasiado"
- El servidor no está respondiendo
- Aumenta el timeout en `src/api/axios.ts` (actual: 30 segundos)
- Verifica la conexión de red

### Caché de Expo sin actualizar
```bash
npx expo start --clear
```

## 📊 Logs de Depuración

La aplicación incluye logs detallados etiquetados:
- `[LOGIN]` - Información de login
- `[AUTH]` - Autenticación y tokens
- `[FETCH]` - Solicitudes HTTP
- `[TASKS]` - Operaciones de tareas
- `[API]` - Respuestas del servidor

## 📦 Scripts Disponibles

```bash
# Iniciar en modo desarrollo
npm start

# Iniciar con caché limpio
npx expo start --clear

# Compilar para producción
expo build:android
expo build:ios

# Ejecutar linter
npm run lint

# Ejecutar tests
npm test
```

## 🚀 Despliegue

### Frontend (Expo)
1. Configura las credenciales de Expo
2. Ejecuta `eas build --platform android` o `--platform ios`
3. Distribuye mediante EAS Submit o Google Play/App Store

### Backend (Cloudflare Workers)
1. Asegúrate de tener cuenta en Cloudflare
2. Configura `wrangler.toml` con tus credenciales
3. Ejecuta `wrangler deploy` en la carpeta del servidor

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo LICENSE para más detalles.

## 👤 Autor

- **Matías Castillo Cáceres** - [@MatiasCastilloCaceres](https://github.com/MatiasCastilloCaceres)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas:
1. Revisa el archivo de Troubleshooting arriba
2. Abre un issue en GitHub
3. Consulta la documentación de Expo: https://docs.expo.dev

---

**Última actualización:** 14 de diciembre de 2025

**Estado:** ✅ En desarrollo activo




