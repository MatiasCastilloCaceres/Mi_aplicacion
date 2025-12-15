import { taskService } from '@/src/api/api';
import { useAuth } from '@/src/context/AuthContext';
import { CreateTaskRequest, Task } from '@/src/types';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TasksScreen() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [operatingTaskId, setOperatingTaskId] = useState<string | null>(null);

  /**
   * GET: Cargar tareas desde el backend
   * Nota: NO se almacenan en AsyncStorage, solo en estado local
   */
  const loadTasks = async () => {
    try {
      setError(null);
      console.log('[TASKS] Cargando tareas del servidor...');
      const data = await taskService.getTasks();
      setTasks(data);
      console.log(`[TASKS] ${data.length} tareas cargadas`);
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al cargar tareas';
      setError(errorMsg);
      console.error('[TASKS] Error al cargar:', errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar tareas al montar el componente
  useEffect(() => {
    loadTasks();
  }, []);

  /**
   * Refresh: Recargar tareas manualmente
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
  };

  /**
   * PATCH: Marcar tarea como completada/no completada
   */
  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    try {
      setOperatingTaskId(taskId);
      console.log(`[TASKS] Actualizando tarea ${taskId}`);
      
      const updatedTask = await taskService.updateTask(taskId, {
        completed: !currentCompleted,
      });

      // Actualizar estado local con la respuesta del servidor
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, completed: updatedTask.completed } : t
        )
      );
      
      console.log(`[TASKS] Tarea ${taskId} actualizada`);
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al actualizar tarea';
      console.error('[TASKS] Error:', errorMsg);
      Alert.alert('Error', errorMsg);
      // No actualizamos el estado local para mantener consistencia
    } finally {
      setOperatingTaskId(null);
    }
  };

  /**
   * DELETE: Eliminar tarea con confirmación
   */
  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Eliminar tarea',
      '¿Estás seguro de que deseas eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              setOperatingTaskId(taskId);
              console.log(`[TASKS] Eliminando tarea ${taskId}`);
              
              await taskService.deleteTask(taskId);

              // Actualizar estado local
              setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
              console.log(`[TASKS] Tarea ${taskId} eliminada`);
            } catch (err: any) {
              const errorMsg = err?.message || 'Error al eliminar tarea';
              console.error('[TASKS] Error al eliminar:', errorMsg);
              Alert.alert('Error', errorMsg);
            } finally {
              setOperatingTaskId(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * POST: Crear nueva tarea
   * Actualmente deshabilitado - integración con TaskForm pendiente
   */
  const handleCreateTask = async (newTask: CreateTaskRequest) => {
    try {
      setOperatingTaskId('creating');
      console.log('[TASKS] Creando nueva tarea:', newTask.title);
      
      const createdTask = await taskService.createTask(newTask);

      // Agregar a la lista local
      setTasks((prevTasks) => [...prevTasks, createdTask]);
      console.log('[TASKS] Tarea creada:', createdTask.id);
      Alert.alert('Éxito', 'Tarea creada correctamente');
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al crear tarea';
      console.error('[TASKS] Error al crear:', errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setOperatingTaskId(null);
    }
  };

  /**
   * Renderizar cada tarea
   */
  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <TouchableOpacity
          style={[styles.checkbox, item.completed && styles.checkboxChecked]}
          onPress={() => handleToggleTask(item.id, item.completed)}
          disabled={operatingTaskId === item.id}
        >
          {operatingTaskId === item.id && (
            <ActivityIndicator size="small" color="#fff" />
          )}
          {!operatingTaskId && item.completed && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <Text
            style={[
              styles.taskTitle,
              item.completed && styles.completedText,
            ]}
          >
            {item.title}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleDeleteTask(item.id)}
          disabled={operatingTaskId === item.id}
        >
          <Text style={styles.deleteButton}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.taskMetadata}>
        {item.photoUri && (
          <View style={styles.photoPreview}>
            <Image
              source={{ uri: item.photoUri }}
              style={styles.photo}
            />
          </View>
        )}

        {item.location?.latitude && item.location?.longitude && (
          <Text style={styles.locationText}>
            📍 {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📋 Tareas</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        <View style={styles.taskCountBadge}>
          <Text style={styles.taskCount}>{tasks.length}</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.errorClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando tareas...</Text>
        </View>
      )}

      {!loading && (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📋</Text>
              <Text style={styles.emptyTitle}>Sin tareas</Text>
              <Text style={styles.emptySubtext}>
                Crea una nueva tarea para empezar
              </Text>
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingVertical: 12,
          }}
        />
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.fab, styles.addButton]}
          onPress={() =>
            Alert.alert(
              'Crear Tarea',
              'Integración con formulario en desarrollo',
              [{ text: 'OK' }]
            )
          }
        >
          <Text style={styles.fabIcon}>➕</Text>
          <Text style={styles.fabText}>Agregar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#007AFF',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  taskCountBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBanner: {
    backgroundColor: '#FFE5E5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#FF3B30',
    borderBottomWidth: 1,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    flex: 1,
  },
  errorClose: {
    fontSize: 18,
    color: '#FF3B30',
    paddingLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskDescription: {
    fontSize: 13,
    color: '#666',
  },
  deleteButton: {
    fontSize: 20,
    paddingHorizontal: 8,
  },
  taskMetadata: {
    marginTop: 12,
    paddingTop: 12,
    borderTopColor: '#eee',
    borderTopWidth: 1,
  },
  photoPreview: {
    marginBottom: 8,
  },
  photo: {
    width: '100%',
    height: 150,
    borderRadius: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#007AFF',
    marginVertical: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  fabIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
