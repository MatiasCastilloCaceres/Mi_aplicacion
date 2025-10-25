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

## 📋 Requisitos Técnicos Cumplidos

- ✅ Desarrollada con React Native utilizando Expo
- ✅ Proyecto configurado en TypeScript (.tsx)
- ✅ Uso obligatorio de Expo Router para navegación
- ✅ Pantalla de Login con validación de contraseña
- ✅ Navegación a vista con Tabs (Home y Perfil)
- ✅ Implementación de manejo de estado con React Hooks
- ✅ Código ordenado, legible y con buenas prácticas

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
- Usa Expo Go en tu dispositivo móvil

## 📁 Estructura del Proyecto

```
app/
├── _layout.tsx              # Layout raíz con AuthProvider
├── login.tsx                # Pantalla de login
└── (tabs)/
    ├── _layout.tsx          # Layout de tabs
    ├── index.tsx            # Pantalla Home
    └── explore.tsx          # Pantalla Perfil

context/
└── AuthContext.tsx          # Context para gestión de autenticación
```

## 🎥 Video de Demostración

**[Ver video de demostración aquí](https://www.loom.com/share/tu-video-id)**



## 🔐 Credenciales de Prueba

- **Email**: usuario@example.com
- **Contraseña**: `1234`

## 📚 Tecnologías Utilizadas

- **React Native** 0.81.5
- **Expo** 54.0.20
- **Expo Router** 6.0.13
- **TypeScript** 5.9.2
- **React** 19.1.0

## 🛠️ Scripts Disponibles

```bash
npm start          # Inicia el servidor de desarrollo
npm run android    # Ejecuta en Android
npm run ios        # Ejecuta en iOS
npm run web        # Ejecuta en web
npm run lint       # Ejecuta linter
```

## 📝 Notas Importantes

- La contraseña correcta es "1234"
- Al iniciar sesión, se guardará el email en el Context
- El email es accesible desde cualquier pantalla dentro de los tabs
- Al cerrar sesión, se limpia el estado y regresa al login

## ✨ Autor

Desarrollo para evaluación académica - React Native con Expo

---

**¡Gracias por revisar mi aplicación!** 🙏
# Mi_aplicacion
