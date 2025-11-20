import { TaskForm } from '@/components/TaskForm';
import { useAuth } from '@/context/AuthContext';
import { useTask } from '@/context/TaskContext';
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
  const { tasks, getTasks, syncTasks, importTasksFromAPI, deleteTask, updateTask, loading, error } = useTask();
  const { email } = useAuth();
  const [formVisible, setFormVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Solo cargar tareas locales al montar
    // No llamar getTasks() aquí para evitar reloads
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await syncTasks();
    await getTasks();
    setRefreshing(false);
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    await updateTask(taskId, { completed: !completed });
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert('Eliminar', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        onPress: () => deleteTask(taskId),
        style: 'destructive',
      },
    ]);
  };

  const handleImportTasks = () => {
    Alert.alert('Importar tareas', 'Importar tareas de la API externa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Importar',
        onPress: importTasksFromAPI,
      },
    ]);
  };

  const renderTaskItem = ({ item }: { item: any }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <TouchableOpacity
          style={[styles.checkbox, item.completed && styles.checkboxChecked]}
          onPress={() => handleToggleTask(item.id, item.completed)}
        >
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, item.completed && styles.completedText]}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={styles.taskDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
          <Text style={styles.deleteButton}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.taskMetadata}>
        {item.photoUri && (
          <View style={styles.photoPreview}>
            <Image source={{ uri: item.photoUri }} style={styles.photo} />
          </View>
        )}

        {item.latitude && item.longitude && (
          <Text style={styles.locationText}>
            📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
          </Text>
        )}

        <View style={styles.syncStatus}>
          <Text style={styles.syncText}>{item.synced ? '✓ Sincronizado' : '⏳ Pendiente'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📋 Mis Tareas</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>
        <View style={styles.taskCountBadge}>
          <Text style={styles.taskCount}>{tasks.length}</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Sincronizando...</Text>
        </View>
      )}

      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📋</Text>
            <Text style={styles.emptyTitle}>Sin tareas</Text>
            <Text style={styles.emptySubtext}>Crea una nueva o importa desde API</Text>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 12 }}
      />

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.fab, styles.importButton]} onPress={handleImportTasks}>
          <Text style={styles.fabIcon}>📥</Text>
          <Text style={styles.fabText}>Importar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.fab, styles.syncButton]} onPress={syncTasks}>
          <Text style={styles.fabIcon}>🔄</Text>
          <Text style={styles.fabText}>Sincronizar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.fab, styles.addButton]} onPress={() => setFormVisible(true)}>
          <Text style={styles.fabIcon}>➕</Text>
          <Text style={styles.fabText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <TaskForm visible={formVisible} onClose={() => setFormVisible(false)} userId={email || '1'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    paddingTop: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  userEmail: {
    fontSize: 12,
    color: '#e0e0ff',
    marginTop: 4,
  },
  taskCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  taskCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 8,
    padding: 14,
    borderLeftWidth: 5,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2.5,
    borderColor: '#ddd',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  completedText: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    fontSize: 20,
    padding: 4,
  },
  taskMetadata: {
    marginTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  photoPreview: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  locationText: {
    fontSize: 12,
    color: '#444',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    fontWeight: '500',
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  syncStatus: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 6,
  },
  syncText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20,
    paddingTop: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
    paddingHorizontal: 10,
  },
  fab: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  fabIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  syncButton: {
    backgroundColor: '#34C759',
  },
  importButton: {
    backgroundColor: '#FF9500',
  },
  fabText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
});
