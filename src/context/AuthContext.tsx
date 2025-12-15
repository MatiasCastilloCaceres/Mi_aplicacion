import { authService } from '@/src/api/api';
import { authService as mockAuthService } from '@/src/api/services.mock';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  userToken: string | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  isUsingMock: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMock, setIsUsingMock] = useState(false);

  /**
   * Bootstrap: Verificar si hay sesión guardada al montar el componente
   * Solo usamos AsyncStorage para el token (necesario para auth)
   */
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        setIsLoading(true);

        // Leer SOLO el token y flag de mock desde AsyncStorage
        // NO guardamos tareas en AsyncStorage (son efímeras, vienen del servidor)
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('user');
        const usingMock = await AsyncStorage.getItem('isUsingMock');

        if (token && userData) {
          try {
            // Verificar que el token aún sea válido contra el servidor
            const service = usingMock === 'true' ? mockAuthService : authService;
            const isValid = await service.validateToken();

            if (isValid) {
              setUserToken(token);
              setUser(JSON.parse(userData));
              setIsUsingMock(usingMock === 'true');
              console.log('[AUTH] Sesión recuperada desde AsyncStorage');
            } else {
              // Token expirado, limpiar todo
              console.warn('[AUTH] Token expirado, limpiando sesión');
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('user');
              await AsyncStorage.removeItem('isUsingMock');
            }
          } catch (validateError) {
            // Si hay error al validar, asumir que el token es válido (fallback)
            // Esto evita que se quede cargando si la API no responde
            console.warn('[AUTH] Error al validar token, asumiendo válido:', validateError);
            setUserToken(token);
            setUser(JSON.parse(userData));
            setIsUsingMock(usingMock === 'true');
          }
        }
      } catch (e) {
        console.error('[AUTH] Error en bootstrap:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  /**
   * Login: SOLO con API real, sin fallback
   */
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('[AUTH] Iniciando login con email:', email);

      // Intentar solo con el servicio real
      console.log('[AUTH] Conectando a API real...');
      const response = await authService.login(email, password);
      
      console.log('[AUTH] Login con API real exitoso');

      // Guardar ONLY token y usuario en AsyncStorage
      await AsyncStorage.setItem('userToken', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      await AsyncStorage.setItem('isUsingMock', 'false');

      // Actualizar estado
      setUserToken(response.token);
      setUser(response.user);
      setIsUsingMock(false);
      
      console.log('[AUTH] Sesión iniciada para:', response.user.email);
    } catch (e: any) {
      const errorMessage = e?.message || 'Error desconocido en login';
      setError(errorMessage);
      console.error('[AUTH] Error en signIn:', errorMessage, e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout: Limpiar sesión (solo API real)
   */
  const signOut = async () => {
    try {
      setIsLoading(true);

      // Logout en la API
      await authService.logout();
    } catch (e) {
      console.warn('[AUTH] Error en logout (no crítico):', e);
    } finally {
      // Limpiar AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isUsingMock');

      // Limpiar estado
      setUserToken(null);
      setUser(null);
      setIsUsingMock(false);
      setIsLoading(false);
      console.log('[AUTH] Sesión finalizada');
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userToken,
        isLoading,
        error,
        signIn,
        signOut,
        clearError,
        isUsingMock,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
