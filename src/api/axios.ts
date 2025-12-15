import AsyncStorage from '@react-native-async-storage/async-storage';

// Obtener la URL de la API desde variables de entorno
// Por defecto usa la API local en localhost:8787
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787';

console.log('[API] URL de API:', API_URL);

/**
 * Cliente HTTP personalizado usando fetch
 * Más confiable que axios en React Native
 */
export async function apiCall<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  const url = `${API_URL}${endpoint}`;

  try {
    console.log(`[FETCH] ${method} ${url}`);
    
    // Obtener token si existe
    const token = await AsyncStorage.getItem('userToken');
    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
      console.log('[FETCH] Token añadido');
    }

    console.log('[FETCH] Headers:', finalHeaders);
    if (body) {
      console.log('[FETCH] Body:', JSON.stringify(body));
    }

    const fetchOptions: RequestInit = {
      method,
      headers: finalHeaders,
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    console.log('[FETCH] Iniciando petición...');
    
    // Timeout de 30 segundos (para API local)
    const timeoutPromise = new Promise<Response>((_, reject) => {
      const timeoutId = setTimeout(() => {
        console.warn('[FETCH] Timeout alcanzado (30 segundos) - API no responde');
        reject(new Error('Timeout: La solicitud tardó demasiado. La API no responde.'));
      }, 30000);
      
      return () => clearTimeout(timeoutId);
    });

    const fetchPromise = fetch(url, fetchOptions);
    let response: Response;
    
    try {
      response = await Promise.race([fetchPromise, timeoutPromise]);
    } catch (raceError: any) {
      console.error('[FETCH] Error en Promise.race:', raceError.message);
      // No intentar reintentos aquí - dejar que AuthContext maneje el fallback a MOCK
      throw raceError;
    }
    
    console.log(`[FETCH] Respuesta recibida: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    console.log('[FETCH] Texto de respuesta:', text);
    
    let data;
    try {
      data = JSON.parse(text);
      console.log('[FETCH] Datos parseados:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('[FETCH] Error al parsear JSON:', parseError);
      throw new Error(`Respuesta no es JSON válido: ${text}`);
    }

    if (!response.ok) {
      const errorMsg = (data as any)?.error || `HTTP ${response.status}`;
      console.error('[FETCH] Error HTTP:', response.status, errorMsg);
      throw new Error(errorMsg);
    }

    console.log('[FETCH] Éxito, devolviendo datos');
    return data as T;
  } catch (error: any) {
    const errorMsg = error?.message || 'Error desconocido';
    console.error('[FETCH] Error en apiCall:', errorMsg);
    console.error('[FETCH] Error tipo:', error?.name || 'Unknown');
    console.error('[FETCH] Error stack:', error?.stack || 'Sin stack');
    
    // Si es error de red, dar más info
    if (errorMsg.includes('Network request failed') || errorMsg.includes('Failed to fetch')) {
      console.error('[FETCH] ⚠️ Error de RED - El dispositivo puede no tener conexión a internet o la URL es inaccesible');
      console.error('[FETCH] URL intentada:', url);
      console.error('[FETCH] Método:', method);
    }
    
    throw error;
  }
}

// Para compatibilidad con código existente
export default { apiCall };
