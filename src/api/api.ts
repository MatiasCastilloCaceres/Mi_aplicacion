import { CreateTaskRequest, LoginResponse, Task, UpdateTaskRequest } from '@/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from './axios';

/**
 * Decodificar JWT manualmente sin verificar la firma
 * Extrae el payload del token - Funciona en React Native y Node.js
 */
function decodeJWT(token: string): any {
  try {
    // Un JWT tiene 3 partes separadas por puntos: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Token inválido: debe tener 3 partes');
    }

    // Decodificar el payload (segunda parte)
    const payload = parts[1];
    
    // Decodificar base64url a string
    // Base64url usa - en lugar de + y _ en lugar de /
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Agregar padding si es necesario
    const padding = 4 - (base64.length % 4);
    if (padding && padding !== 4) {
      base64 += '='.repeat(padding);
    }
    
    // Decodificar - intentar con atob primero (disponible en navegadores y React Native)
    let decoded;
    if (typeof atob === 'function') {
      // atob disponible en navegadores y React Native
      decoded = JSON.parse(atob(base64));
    } else {
      // Fallback para Node.js
      decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    }
    
    console.log('[JWT] Token decodificado correctamente');
    console.log('[JWT] Payload:', decoded);
    return decoded;
  } catch (error: any) {
    console.error('[JWT] Error al decodificar token:', error.message);
    return null;
  }
}

/**
 * Interface para respuesta envuelta del servidor
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Manejo centralizado de errores HTTP
 */
function handleApiError(error: any): string {
  console.log('[API] Manejando error:', error);
  console.log('[API] Error message:', error?.message);
  console.log('[API] Error status:', error?.status);
  
  // Timeout - buscar en el mensaje
  if (error?.message?.includes('Timeout') || error?.message?.includes('timeout')) {
    console.log('[API] Detectado error de timeout');
    return 'La conexión tardó demasiado. Verifica tu conexión a internet y que el servidor esté disponible.';
  }
  
  // Error de respuesta HTTP con status code
  if (error.response?.status) {
    const status = error.response.status;
    const message = error.response?.data?.error || error.response?.data?.message;

    console.log('[API] Error HTTP:', status, 'Mensaje:', message);

    switch (status) {
      case 400:
        return `Solicitud inválida: ${message || 'Verifica los datos enviados'}`;
      case 401:
        return 'No autorizado: Token expirado o inválido';
      case 403:
        return 'Acceso denegado: No tienes permiso para esta acción';
      case 404:
        return 'Recurso no encontrado';
      case 409:
        return `Conflicto: ${message || 'El recurso ya existe'}`;
      case 422:
        return `Datos inválidos: ${message || 'Verifica los campos'}`;
      case 500:
        return 'Error del servidor: Intenta más tarde';
      case 503:
        return 'Servicio no disponible: Intenta más tarde';
      default:
        return message || `Error HTTP ${status}`;
    }
  }

  // Error de timeout (código ECONNABORTED de axios)
  if (error.code === 'ECONNABORTED') {
    return 'Tiempo de espera agotado: La conexión tardó demasiado';
  }

  // Error de conexión
  if (error.message?.includes('Network') || error.message?.includes('network')) {
    return 'Error de conexión: Verifica tu conexión a internet';
  }

  // Error genérico
  const msg = error.message || 'Error desconocido';
  console.log('[API] Error genérico:', msg);
  return msg;
}

/**
 * Validar respuesta del servidor (formato { success, data })
 */
function validateResponse<T>(response: any): T {
  console.log('[API] Validando respuesta:', JSON.stringify(response, null, 2));
  
  // La respuesta viene envuelta en { success, data }
  const apiResponse = response as ApiResponse<T>;
  
  if (apiResponse.success === false) {
    throw new Error(apiResponse.error || 'Error desconocido del servidor');
  }

  if (!apiResponse.data && apiResponse.data !== false && apiResponse.data !== 0 && apiResponse.data !== '') {
    throw new Error('Respuesta vacía del servidor');
  }

  return apiResponse.data as T;
}

/**
 * Servicio de Autenticación
 */
export const authService = {
  /**
   * Registrar un nuevo usuario
   * POST /auth/register
   */
  register: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      if (password.length < 6) {
        throw new Error('Contraseña debe tener mínimo 6 caracteres');
      }

      console.log('[AUTH] Registrando usuario:', email);
      const response = await apiCall<ApiResponse<LoginResponse>>('/auth/register', {
        method: 'POST',
        body: { email, password },
      });

      const data = validateResponse<LoginResponse>(response);
      
      if (!data.token || !data.user?.id) {
        throw new Error('Estructura de respuesta inválida del servidor');
      }

      console.log('[AUTH] Registro exitoso para:', data.user.email);
      return data;
    } catch (error: any) {
      const message = handleApiError(error);
      console.error('[AUTH] Error en registro:', message);
      throw new Error(message);
    }
  },

  /**
   * Login del usuario
   * POST /auth/login
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      // Validar entrada
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      console.log('[AUTH] Intentando login con:', email);
      console.log('[AUTH] Enviando POST a /auth/login');
      
      const response = await apiCall<ApiResponse<LoginResponse>>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      console.log('[AUTH] Respuesta recibida del servidor');
      
      // Validar respuesta
      const data = validateResponse<LoginResponse>(response);
      
      // Validar estructura de respuesta
      if (!data.token || !data.user?.id) {
        throw new Error('Estructura de respuesta inválida del servidor: falta token o user.id');
      }

      console.log('[AUTH] Login exitoso para:', data.user.email);
      return data;
    } catch (error: any) {
      const message = handleApiError(error);
      console.error('[AUTH] Error en login:', message);
      console.error('[AUTH] Error objeto completo:', error);
      throw new Error(message);
    }
  },

  /**
   * Logout del usuario
   * NOTA: La API no tiene endpoint de logout, solo limpiar el token local
   */
  logout: async (): Promise<void> => {
    try {
      console.log('[AUTH] Logout ejecutado (limpieza local)');
      // El servidor no requiere logout, la autenticación es stateless (JWT)
    } catch (error: any) {
      console.warn('[AUTH] Error en logout (no crítico):', error.message);
    }
  },

  /**
   * Validar si el token es válido
   * Solo decodifica el JWT sin llamar al servidor (mucho más rápido)
   */
  validateToken: async (): Promise<boolean> => {
    try {
      // Obtener token del storage
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.warn('[AUTH] No hay token guardado');
        return false;
      }

      // Decodificar el JWT para validar su estructura
      const decoded = decodeJWT(token);
      
      if (!decoded) {
        console.warn('[AUTH] No se pudo decodificar el token');
        return false;
      }

      // Verificar que el token no esté expirado
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        console.warn('[AUTH] Token expirado');
        return false;
      }

      console.log('[AUTH] Token válido (decodificación local)');
      return true;
    } catch (error: any) {
      console.warn('[AUTH] Error validando token:', error.message);
      return false;
    }
  },
};

/**
 * Servicio de Tareas
 * NOTA: El API usa /todos pero mantenemos el nombre interno taskService
 */
export const taskService = {
  /**
   * Obtener todas las tareas del usuario
   * GET /todos
   * NOTA: Solo usa API real, sin fallback
   */
  getTasks: async (): Promise<Task[]> => {
    console.log('[TASKS] Obteniendo tareas del API real...');
    
    try {
      const response = await apiCall<ApiResponse<Task[]>>('/todos', {
        method: 'GET',
      });
      
      const data = validateResponse<Task[]>(response);
      
      if (!Array.isArray(data)) {
        throw new Error('Respuesta debe ser un array de tareas');
      }

      console.log(`[TASKS] ✅ Se obtuvieron ${data.length} tareas del API`);
      return data;
    } catch (apiError: any) {
      console.error('[TASKS] Error obteniendo tareas:', apiError?.message || String(apiError));
      throw apiError;
    }
  },

  /**
   * Crear una nueva tarea (solo API real)
   * POST /todos
   */
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    if (!data.title || !data.title.trim()) {
      throw new Error('El título de la tarea es requerido');
    }

    console.log('[TASKS] Creando tarea:', data.title);

    const payload: any = {
      title: data.title.trim(),
      completed: false,
    };

    if (data.latitude !== undefined || data.longitude !== undefined) {
      payload.location = {
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      };
    }

    if (data.photoUri) {
      payload.photoUri = data.photoUri;
    }

    try {
      console.log('[TASKS] Creando en API...');
      const response = await apiCall<ApiResponse<Task>>('/todos', {
        method: 'POST',
        body: payload,
      });
      const createdTask = validateResponse<Task>(response);
      console.log('[TASKS] ✅ Tarea creada:', createdTask.id);
      return createdTask;
    } catch (apiError: any) {
      console.error('[TASKS] Error creando tarea:', apiError?.message || String(apiError));
      throw apiError;
    }
  },

  /**
   * Actualizar una tarea (solo API real)
   * PATCH /todos/:id
   */
  updateTask: async (id: string, updateData: UpdateTaskRequest): Promise<Task> => {
    if (!id || !id.trim()) {
      throw new Error('ID de tarea es requerido');
    }

    console.log('[TASKS] Actualizando tarea:', id);

    try {
      console.log('[TASKS] Enviando actualización al API...');
      const response = await apiCall<ApiResponse<Task>>(`/todos/${id}`, {
        method: 'PATCH',
        body: updateData,
      });
      const updatedTask = validateResponse<Task>(response);
      console.log('[TASKS] ✅ Tarea actualizada:', id);
      return updatedTask;
    } catch (apiError: any) {
      console.error('[TASKS] Error actualizando tarea:', apiError?.message || String(apiError));
      throw apiError;
    }
  },

  /**
   * Eliminar una tarea (solo API real)
   * DELETE /todos/:id
   */
  deleteTask: async (id: string): Promise<void> => {
    if (!id || !id.trim()) {
      throw new Error('ID de tarea es requerido');
    }

    console.log('[TASKS] Eliminando tarea:', id);

    try {
      console.log('[TASKS] Enviando eliminación al API...');
      await apiCall<void>(`/todos/${id}`, {
        method: 'DELETE',
      });
      console.log('[TASKS] ✅ Tarea eliminada:', id);
    } catch (apiError: any) {
      console.error('[TASKS] Error eliminando tarea:', apiError?.message || String(apiError));
      throw apiError;
    }
  },
};

export default {
  authService,
  taskService,
};
