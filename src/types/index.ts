// Tipos de autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  token: string;
}

// Tipos de ubicación
export interface Location {
  latitude: number;
  longitude: number;
}

// Tipos de tareas
export interface Task {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  location?: Location;
  photoUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  latitude?: number;
  longitude?: number;
  photoUri?: string;
}

export interface UpdateTaskRequest {
  completed?: boolean;
  title?: string;
  location?: Location;
  photoUri?: string;
}

// Tipos de errores
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
