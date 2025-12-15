import {
    CreateTaskRequest,
    LoginResponse,
    Task,
} from '@/src/types';

/**
 * Mock Service - Para desarrollo sin backend
 * Reemplazar con verdadero servicio cuando el backend esté listo
 */

// Datos de prueba mock
const MOCK_USER = {
  id: 'user-123',
  email: 'demo@example.com',
  name: 'Usuario Demo',
};

const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoiZGVtb0BleGFtcGxlLmNvbSIsImlhdCI6MTYzOTEyMzQ1Nn0.demo_token';

let MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Tarea de ejemplo 1',
    description: 'Esta es una tarea de ejemplo',
    completed: false,
    userId: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Tarea completada',
    description: 'Ya está hecha',
    completed: true,
    userId: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Servicio de Autenticación (Mock)
 */
export const authService = {
  /**
   * Login del usuario
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    console.log('[MOCK] Login:', email);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Para este demo, aceptar cualquier email y contraseña
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    return {
      user: {
        ...MOCK_USER,
        email, // Usar el email proporcionado
      },
      token: MOCK_TOKEN,
    };
  },

  /**
   * Logout del usuario
   */
  logout: async (): Promise<void> => {
    console.log('[MOCK] Logout');
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  /**
   * Verificar si el token es válido
   */
  validateToken: async (): Promise<boolean> => {
    console.log('[MOCK] Validating token');
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  },
};

/**
 * Servicio de Tareas (Mock)
 */
export const taskService = {
  /**
   * Obtener todas las tareas del usuario
   */
  getTasks: async (): Promise<Task[]> => {
    console.log('[MOCK] Getting tasks');
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_TASKS;
  },

  /**
   * Crear una nueva tarea
   */
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    console.log('[MOCK] Creating task:', data.title);
    await new Promise(resolve => setTimeout(resolve, 800));

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: data.title,
      description: data.description,
      completed: false,
      photoUri: data.photoUri,
      latitude: data.latitude,
      longitude: data.longitude,
      userId: 'user-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_TASKS.push(newTask);
    return newTask;
  },

  /**
   * Actualizar una tarea
   */
  updateTask: async (id: string, completed: boolean): Promise<Task> => {
    console.log('[MOCK] Updating task:', id, 'completed:', completed);
    await new Promise(resolve => setTimeout(resolve, 500));

    const task = MOCK_TASKS.find(t => t.id === id);
    if (!task) {
      throw new Error('Tarea no encontrada');
    }

    task.completed = completed;
    task.updatedAt = new Date().toISOString();
    return task;
  },

  /**
   * Eliminar una tarea
   */
  deleteTask: async (id: string): Promise<void> => {
    console.log('[MOCK] Deleting task:', id);
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = MOCK_TASKS.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Tarea no encontrada');
    }

    MOCK_TASKS.splice(index, 1);
  },
};

export default {
  authService,
  taskService,
};
