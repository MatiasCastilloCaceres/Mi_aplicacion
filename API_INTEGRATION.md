# 🔌 DOCUMENTACIÓN DE INTEGRACIÓN CON APIS

## 1. ENDPOINTS UTILIZADOS

### Base URL
```
https://jsonplaceholder.typicode.com
```

### Endpoints Implementados

#### 1.1 Crear Tarea (POST)
```
POST /todos
Content-Type: application/json

Body:
{
  "title": "string",
  "completed": "boolean",
  "userId": "number"
}

Response (201):
{
  "userId": 1,
  "id": 101,
  "title": "string",
  "completed": false
}
```

#### 1.2 Obtener Tareas (GET)
```
GET /todos?_limit=10

Response (200):
[
  {
    "userId": 1,
    "id": 1,
    "title": "delectus aut autem",
    "completed": false
  },
  ...
]
```

#### 1.3 Actualizar Tarea (PATCH)
```
PATCH /todos/{id}
Content-Type: application/json

Body:
{
  "completed": true
}

Response (200):
{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": true
}
```

#### 1.4 Eliminar Tarea (DELETE)
```
DELETE /todos/{id}

Response (200):
{}
```

---

## 2. IMPLEMENTACIÓN EN CÓDIGO

### 2.1 Crear Tarea
```typescript
async addTask(task: Omit<Task, 'id' | 'createdAt' | 'synced'>) {
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: task.title,
      completed: task.completed,
      userId: task.userId,
    }),
  });
}
```

### 2.2 Obtener Tareas
```typescript
async getTasks() {
  const response = await fetch(`${API_BASE_URL}/todos?_limit=10`);
  const data = await response.json();
  
  // Validación de datos
  const validTasks = data
    .filter((t: any) => t.id && t.title)
    .map((t: any) => ({
      id: t.id.toString(),
      title: t.title || 'Sin título',
      completed: t.completed || false,
      ...
    }));
}
```

### 2.3 Actualizar Tarea
```typescript
async updateTask(id: string, updates: Partial<Task>) {
  await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}
```

### 2.4 Eliminar Tarea
```typescript
async deleteTask(id: string) {
  await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'DELETE',
  });
}
```

---

## 3. SINCRONIZACIÓN LOCAL/REMOTO

### Flujo de Sincronización
```
1. Usuario crea tarea
   ↓
2. Guardar LOCALMENTE inmediatamente
   ↓
3. Intentar enviar a servidor (async)
   ├─ Si éxito → marcar synced = true
   └─ Si fallo → mantener synced = false (pendiente)
   ↓
4. Mostrar indicador de estado
```

### Código de Sincronización
```typescript
const syncTasks = async () => {
  const unsyncedTasks = tasks.filter(t => !t.synced);
  
  for (const task of unsyncedTasks) {
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
        task.synced = true;
      }
    } catch (err) {
      console.error(`Error sincronizando ${task.id}`);
    }
  }
};
```

---

## 4. IMPORTACIÓN DE API EXTERNA

```typescript
const importTasksFromAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/todos?_limit=5`);
  const data = await response.json();
  
  // Validar y convertir
  const importedTasks: Task[] = data
    .filter((t: any) => t.title)  // Solo válidas
    .map((t: any) => ({
      id: `imported-${t.id}`,
      title: `[Importada] ${t.title}`,
      completed: t.completed || false,
      userId: '1',
      synced: true,
    }));
  
  // Agregar a lista local
  const merged = [...tasks, ...importedTasks];
  await saveLocalTasks(merged);
};
```

---

## 5. MANEJO DE ERRORES

### Tipos de Error
| Error | Causa | Manejo |
|-------|-------|--------|
| `NetworkError` | Sin conexión | Guardar localmente, reintentar después |
| `4xx` | Error del cliente | Mostrar alerta, validar datos |
| `5xx` | Error del servidor | Usar caché local, reintentar automático |
| `Datos incompletos` | API devuelve null | Usar valores por defecto |

### Implementación
```typescript
try {
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status >= 500) {
      // Error servidor: usar local
      setError('Servidor no disponible, usando datos locales');
      await loadLocalTasks();
    } else {
      // Error cliente
      throw new Error(`Error ${response.status}`);
    }
  }
  
  const data = await response.json();
  // Validar datos...
  
} catch (err) {
  if (err instanceof TypeError) {
    // No hay conexión
    console.log('Sin conexión, modo offline');
  } else {
    setError(err.message);
  }
}
```

---

## 6. VALIDACIÓN DE DATOS

```typescript
// Validar respuesta de API
const validTasks = data
  .filter((t: any) => {
    // Campos requeridos
    if (!t.id || !t.title) return false;
    
    // Tipos correctos
    if (typeof t.id !== 'number') return false;
    if (typeof t.title !== 'string') return false;
    if (typeof t.completed !== 'boolean') return false;
    
    return true;
  })
  .map((t: any) => ({
    id: t.id.toString(),
    title: t.title.substring(0, 255),  // Limitar longitud
    description: t.description || '',
    completed: Boolean(t.completed),
    userId: String(t.userId || '1'),
    createdAt: new Date().toISOString(),
    synced: true,
  }));
```

---

## 7. SEGURIDAD

### Headers de Seguridad
```typescript
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  // 'Authorization': 'Bearer token' (si se implementa autenticación)
};
```

### Validación de HTTPS
```typescript
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';
// ✅ HTTPS obligatorio
// ❌ NO usar http://
```

### Almacenamiento de Credenciales
```typescript
// ❌ MAL - Almacenar tokens en texto plano
localStorage.setItem('token', 'mi-token-secreto');

// ✅ BIEN - Usar SecureStore (Capacitor)
import { SecureStore } from '@capacitor/secure-storage';
await SecureStore.set({ key: 'token', value: 'mi-token-secreto' });
```

---

## 8. OPTIMIZACIÓN

### Rate Limiting
```typescript
const syncWithDelay = async () => {
  const SYNC_INTERVAL = 5000; // 5 segundos mínimo
  
  if (Date.now() - lastSyncTime < SYNC_INTERVAL) {
    console.log('Esperando antes de siguiente sync...');
    return;
  }
  
  await syncTasks();
  lastSyncTime = Date.now();
};
```

### Paginación
```typescript
// Obtener tareas paginadas
const getTasks = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const response = await fetch(
    `${API_BASE_URL}/todos?_start=${skip}&_limit=${limit}`
  );
};
```

### Caché Local
```typescript
const getCachedTasks = () => {
  const cached = localStorage.getItem('tasks_cache');
  const cacheTime = localStorage.getItem('cache_timestamp');
  
  // Invalidar caché después de 1 hora
  if (cached && Date.now() - cacheTime < 3600000) {
    return JSON.parse(cached);
  }
  
  return null;
};
```

---

## 9. TESTING DE APIS

### Test: Crear tarea
```typescript
describe('TaskContext - Crear Tarea', () => {
  it('debe crear tarea localmente', async () => {
    await addTask({
      title: 'Test',
      description: '',
      completed: false,
      userId: '1',
    });
    
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Test');
  });
});
```

### Test: Sincronización
```typescript
describe('TaskContext - Sincronización', () => {
  it('debe marcar como sincronizado después de envío exitoso', async () => {
    // Mock de fetch
    jest.mock('fetch', () => Promise.resolve({ ok: true }));
    
    await syncTasks();
    
    expect(tasks[0].synced).toBe(true);
  });
});
```

---

## 10. REFERENCIA RÁPIDA

| Acción | Endpoint | Método |
|--------|----------|--------|
| Crear | `/todos` | POST |
| Listar | `/todos?_limit=10` | GET |
| Obtener uno | `/todos/{id}` | GET |
| Actualizar | `/todos/{id}` | PATCH |
| Eliminar | `/todos/{id}` | DELETE |
| Importar | `/todos?_limit=5` | GET |

---

*Documentación: 20 de Noviembre de 2025*
