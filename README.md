# Mi Aplicación - React Native con Expo �

Esta es una aplicación móvil desarrollada con **React Native** y **Expo** que implementa un sistema de autenticación con login y navegación por tabs.

## 🎯 Características

- ✅ **Pantalla de Login** con validación de credenciales
  - Campo de Email
  - Campo de Contraseña (modo seguro)
  - Validación: Contraseña correcta = "1234"
  - Manejo de errores con mensajes claros

- ✅ **Navegación con Expo Router**
  - Login como pantalla inicial
  - Navegación a tabs después de autenticación correcta
  
- ✅ **Pantalla Home (Tab)**
  - Mensaje de bienvenida
  - Muestra el email del usuario autenticado

- ✅ **Pantalla Perfil (Tab)**
  - Muestra el email ingresado en el login
  - Botón para cerrar sesión
  - Regresa a login al cerrar sesión

- ✅ **Gestión de Estado**
  - Context API para compartir el estado de autenticación
  - React Hooks (useState, useContext)

- ✅ **TypeScript**
  - Código tipado en archivos `.tsx`
  - Mejor seguridad de tipos

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar la aplicación
```bash
npm start
```

### 3. Opciones para ejecutar
- Presiona `i` para iOS Simulator
- Presiona `a` para Android Emulator
- Presiona `w` para Web
# Mi Aplicación - React Native (Expo) — Informe de cumplimiento

Esta aplicación es un proyecto desarrollado con **React Native** y **Expo**, escrito en **TypeScript** y usando **Expo Router** para la navegación. El objetivo de este documento es resumir el cumplimiento de las especificaciones solicitadas y dar instrucciones rápidas para evaluar la aplicación.

**Estado de cumplimiento (resumen):**
- React Native + Expo: ✅
- TypeScript (`.tsx`): ✅
- Expo Router: ✅
- Login (Evaluación 1): ✅
- TODO List con foto + ubicación + persistencia por usuario: ✅

---

## 1) Enlace a un video corto

Coloca aquí un enlace a un video corto (Loom, YouTube, etc.) que muestre la app en funcionamiento. Reemplaza el placeholder por tu enlace real:

- Video demostración (ejemplo): https://youtu.be/TU_VIDEO_EJEMPLO

Instrucciones: sustituye el enlace anterior por el de tu grabación.

---

## 2) Tecnologías principales

- React Native (Expo)
- Expo Router (navegación)
- TypeScript (.tsx)
- Context API (AuthContext, TaskContext)
- AsyncStorage (`@react-native-async-storage/async-storage`) para persistencia local
- expo-image-picker / expo-file-system para fotos
- expo-location para ubicación

---

## 3) Credenciales de prueba (login)

- Email: `usuario@example.com`
- Contraseña: `1234`

El login está implementado en `app/login.tsx` y `context/AuthContext.tsx`. El comportamiento esperado:
- Al iniciar sesión con las credenciales de prueba, el usuario accede a las pantallas con tabs.
- El `AuthContext` guarda el `email` del usuario y permite cerrar sesión.

---

## 4) TODO List — Requisitos y cómo probar

La funcionalidad de TODO List está implementada usando `TaskForm.tsx` (formulario) y `TaskContext.tsx` (lógica y persistencia). Resumen de las funcionalidades solicitadas y dónde encontrarlas:

- **Crear tareas desde un formulario**: `components/TaskForm.tsx`.
  - Campos: título (requerido), descripción (opcional), foto (desde cámara/galería) y ubicación (obtenida con `expo-location`).
- **Asociar tarea a usuario**: cada tarea tiene `userId` (se usa el `email` del `AuthContext`). **Solo se muestran las tareas del usuario autenticado** mediante filtro en `app/(tabs)/tasks.tsx`. (Revisar `TaskContext.tsx` y `app/(tabs)/tasks.tsx`.)
- **Eliminar tareas**: acción disponible en la lista de tareas (`tasks.tsx`). Botón 🗑️ con confirmación.
- **Marcar completadas / no completadas**: toggle de estado en cada tarjeta de tarea (checkbox interactivo).

Pasos rápidos para probar:
1. Inicia la app: `npm start` y abre en Expo Go o emulador.
2. Login con `usuario@example.com` / `1234`.
3. Ve a la pestaña Tareas y presiona `Agregar` para abrir el formulario.
4. Rellena título, toma o selecciona una foto y pulsa el botón para obtener la ubicación.
5. Guarda la tarea; verifica que aparece en la lista con la foto y la coordenada.
6. Prueba eliminar y marcar completada.
7. Cierra sesión y crea otro usuario (o login con email diferente): verifica que NO ve las tareas del primer usuario.



---

## 5) Persistencia local

- Las tareas se guardan en AsyncStorage (clave usada por `TaskContext.tsx`). Esto garantiza que las tareas permanezcan aunque cierres la app y no haya conexión.
- Las fotos se guardan en el sistema de archivos del dispositivo usando `expo-file-system` (o a través de `expo-image-picker` que devuelve URIs locales). En `TaskForm.tsx` se guarda la URI en la tarea y la app muestra la imagen con `Image`.

Notas técnicas:
- Paquete AsyncStorage: `@react-native-async-storage/async-storage` (debe estar instalado en el proyecto).
- Para producción se recomienda migrar las imágenes a almacenamiento dedicado o subir a un backend si necesita sincronización entre dispositivos.

---

## 6) Estructura de datos (modelo `Task`)

Ejemplo de la interfaz usada:

```ts
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  photoUri?: string; // URI local de la foto
  latitude?: number;
  longitude?: number;
  createdAt: string;
  userId: string; // email del usuario
  synced?: boolean;
}
```

---

## 7) Archivos clave (referencias)

- `app/login.tsx` — pantalla de login
- `context/AuthContext.tsx` — gestión de autenticación y estado del usuario
- `context/TaskContext.tsx` — CRUD de tareas, persistencia y sincronización
- `components/TaskForm.tsx` — formulario para crear/editar tareas (foto + ubicación)
- `app/(tabs)/tasks.tsx` — lista de tareas del usuario

---

## 8) Cómo ejecutar (resumen)

```pwsh
npm install
npm start
# en la terminal de Expo: presiona 'a' para Android o 'i' para iOS, o usa Expo Go
```

---

Si quieres, puedo:
- Insertar el enlace real del video (si me lo proporcionas).
- Añadir instrucciones de build (`eas build`) para generar APK/IPA.
- Revisar `TaskContext.tsx` y `TaskForm.tsx` y confirmar unidades específicas si quieres una verificación más exhaustiva.

---

Última actualización: 23 de noviembre de 2025




