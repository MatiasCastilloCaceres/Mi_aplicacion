import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  photoUri?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  userId: string;
  synced: boolean;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'synced'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTasks: () => Promise<void>;
  syncTasks: () => Promise<void>;
  importTasksFromAPI: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'https://jsonplaceholder.typicode.com';
  const STORAGE_KEY = 'tasks';

  // Guardar tareas localmente sin hacer setTasks
  const saveLocalTasksOnly = async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (err) {
      console.error('Error guardando tareas locales:', err);
    }
  };

  // Guardar tareas localmente (con setTasks)
  const saveLocalTasks = async (newTasks: Task[]) => {
    await saveLocalTasksOnly(newTasks);
    setTasks(newTasks);
  };

  const loadAndSetTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const loaded = JSON.parse(stored);
        setTasks(loaded);
        return loaded;
      }
    } catch (err) {
      console.error('Error cargando tareas locales:', err);
    }
    return [];
  };

  // Crear tarea
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'synced'>) => {
    try {
      setLoading(true);
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        synced: false,
      };

      // Actualizar estado con la nueva tarea
      setTasks((prevTasks) => {
        const updated = [...prevTasks, newTask];
        // Guardar en storage inmediatamente
        saveLocalTasksOnly(updated).catch(err => console.error(err));
        return updated;
      });

      // Intentar sincronizar con API (no-blocking)
      setTimeout(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: task.title,
              completed: task.completed,
              userId: task.userId,
            }),
          });

          if (response.ok) {
            newTask.synced = true;
            setTasks((latestTasks) => {
              const updatedSync = latestTasks.map(t => t.id === newTask.id ? newTask : t);
              saveLocalTasksOnly(updatedSync).catch(err => console.error(err));
              return updatedSync;
            });
          }
        } catch (syncErr) {
          console.log('No se pudo sincronizar (sin conexión), se guardó localmente');
        }
      }, 0);

      setError(null);
    } catch (err) {
      setError('Error al crear tarea');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar tarea
  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      setLoading(true);
      setTasks((prevTasks) => {
        const updated = prevTasks.map(t => (t.id === id ? { ...t, ...updates } : t));
        saveLocalTasksOnly(updated).catch(err => console.error(err));
        return updated;
      });

      // Intentar sincronizar (no-blocking)
      setTimeout(async () => {
        if (!updates.id) {
          try {
            await fetch(`${API_BASE_URL}/todos/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            });
          } catch (syncErr) {
            console.log('Actualización pendiente de sincronización');
          }
        }
      }, 0);

      setError(null);
    } catch (err) {
      setError('Error al actualizar tarea');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar tarea
  const deleteTask = async (id: string) => {
    try {
      setLoading(true);
      setTasks((prevTasks) => {
        const updated = prevTasks.filter(t => t.id !== id);
        saveLocalTasksOnly(updated).catch(err => console.error(err));
        return updated;
      });

      // Intentar sincronizar (no-blocking)
      setTimeout(async () => {
        try {
          await fetch(`${API_BASE_URL}/todos/${id}`, { method: 'DELETE' });
        } catch (syncErr) {
          console.log('Eliminación pendiente de sincronización');
        }
      }, 0);

      setError(null);
    } catch (err) {
      setError('Error al eliminar tarea');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener tareas - cargar solo locales sin sobrescribir
  const getTasks = async () => {
    try {
      setLoading(true);
      // Solo cargar desde storage local, no descargar del API
      // para evitar perder tareas locales
      await loadAndSetTasks();
      setError(null);
    } catch (err) {
      setError('Error al obtener tareas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar tareas local/remoto
  const syncTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Iniciando sincronización con API...');

      // Intentar obtener tareas del API para sincronizar
      const response = await fetch(`${API_BASE_URL}/todos?_limit=10`);
      
      if (!response.ok) {
        throw new Error(`Error de API: ${response.status}`);
      }

      const data = await response.json();
      console.log('Tareas descargadas de API:', data.length);

      if (!Array.isArray(data)) {
        throw new Error('Respuesta de API inválida');
      }

      // Validar y convertir datos
      const validTasks: Task[] = data
        .filter((t: any) => t.id && t.title)
        .map((t: any, index: number) => ({
          id: `api-${t.id}`,
          title: t.title || 'Sin título',
          description: '',
          completed: t.completed || false,
          createdAt: new Date().toISOString(),
          userId: t.userId?.toString() || 'usuario@example.com',
          synced: true,
        }));

      console.log('Tareas válidas:', validTasks.length);

      // Mezclar con tareas locales
      const currentTasks = tasks || [];
      const existingApiIds = new Set(currentTasks.filter(t => t.id.startsWith('api-')).map(t => t.id));
      const newTasks = validTasks.filter(t => !existingApiIds.has(t.id));
      
      console.log('Tareas nuevas a agregar:', newTasks.length);

      const merged = [...currentTasks, ...newTasks];
      
      await saveLocalTasksOnly(merged);
      setTasks(merged);
      
      setError(null);
      console.log('Sincronización completada exitosamente');
    } catch (err: any) {
      const errorMsg = err?.message || 'Error en sincronización';
      setError(errorMsg);
      console.error('Error en sincTasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Importar tareas de API externa
  const importTasksFromAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/todos?_limit=5`, {
        timeout: 10000, // timeout de 10 segundos
      });

      if (!response.ok) {
        setError('Error al conectar con la API');
        throw new Error(`Error importando tareas: ${response.status}`);
      }

      const data = await response.json();

      // Validar y convertir
      const importedTasks: Task[] = data
        .filter((t: any) => t.title)
        .map((t: any, index: number) => ({
          id: `imported-${t.id}-${Date.now()}-${index}`,
          title: `[Importada] ${t.title}`,
          description: '',
          completed: t.completed || false,
          createdAt: new Date().toISOString(),
          userId: '1',
          synced: true,
        }));

      setTasks((prevTasks) => {
        const merged = [...prevTasks, ...importedTasks];
        saveLocalTasksOnly(merged).catch(err => console.error(err));
        return merged;
      });
      
      setError(null);
    } catch (err) {
      setError('Error importando tareas de API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar tareas al montar
  useEffect(() => {
    const initializeTasks = async () => {
      try {
        // Cargar tareas locales sin limpiar
        await loadAndSetTasks();
      } catch (err) {
        console.error('Error inicializando tareas:', err);
      }
    };
    initializeTasks();
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        getTasks,
        syncTasks,
        importTasksFromAPI,
        loading,
        error,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask debe ser usado dentro de TaskProvider');
  }
  return context;
};
