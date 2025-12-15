import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const router = useRouter();
  const { signIn, error: authError, isLoading, clearError, isUsingMock } = useAuth();

  useEffect(() => {
    // Limpiar error cuando el usuario empieza a escribir
    if (authError) {
      clearError();
    }
  }, [authError, clearError, email, password]);

  const handleLogin = async () => {
    // Validación básica
    if (!email.trim() || !password.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    try {
      console.log('[LOGIN] Iniciando login...');
      await signIn(email, password);
      console.log('[LOGIN] Login exitoso, navegando...');
      // Esperar un poco para asegurar que el estado se actualizó
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } catch (err: any) {
      // El error ya está en el contexto, pero también lo logueamos
      const errorMsg = err?.message || 'Error desconocido';
      console.error('[LOGIN] Error en login:', errorMsg);
      alert(`Error: ${errorMsg}`);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.wrapper}>
        <Text style={styles.title}>Mi Aplicación</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        {authError && (
          <Text style={styles.errorText}>{authError}</Text>
        )}

        {isUsingMock && (
          <View style={styles.mockBanner}>
            <Text style={styles.mockBannerText}>⚠️ Modo Demo - API no disponible</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>📌 Instrucciones:</Text>
          <Text style={styles.footerSubtext}>1. Primero debes registrarte en Swagger:</Text>
          <Text style={styles.footerSubtext}>   https://basic-hono-api.borisbelmarm.workers.dev/docs</Text>
          <Text style={styles.footerSubtext}>2. POST /auth/register con tu email y contraseña</Text>
          <Text style={styles.footerSubtext}>3. Luego inicia sesión aquí con esas credenciales</Text>
          {isUsingMock && (
            <Text style={styles.footerSubtext}>⚠️ O usa cualquier email/password en modo MOCK</Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  footer: {
    marginTop: 40,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  mockBanner: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEC8B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  mockBannerText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
