import { useTask } from '@/context/TaskContext';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ visible, onClose, userId }) => {
  const { addTask, loading } = useTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleTakePhoto = async () => {
    try {
      setTakingPhoto(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al acceder a la cámara');
    } finally {
      setTakingPhoto(false);
    }
  };

  const handleGetLocation = async () => {
    try {
      setGettingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita permiso de ubicación');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      Alert.alert('Ubicación capturada', `${loc.coords.latitude}, ${loc.coords.longitude}`);
    } catch (error) {
      Alert.alert('Error', 'Error al obtener ubicación. Verifica GPS.');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }

    await addTask({
      title,
      description,
      completed: false,
      photoUri,
      latitude: location?.latitude,
      longitude: location?.longitude,
      userId,
    });

    // Limpiar formulario
    setTitle('');
    setDescription('');
    setPhotoUri(undefined);
    setLocation(undefined);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nueva Tarea</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <Text style={styles.saveButton}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Título de la tarea"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Descripción detallada"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={!loading}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleTakePhoto}
            disabled={loading || takingPhoto}
          >
            {takingPhoto ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {photoUri ? '✓ Foto capturada' : '📷 Tomar foto'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleGetLocation}
            disabled={loading || gettingLocation}
          >
            {gettingLocation ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {location ? '✓ Ubicación capturada' : '📍 Obtener ubicación'}
              </Text>
            )}
          </TouchableOpacity>

          {location && (
            <View style={styles.info}>
              <Text style={styles.infoText}>
                📍 Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    color: '#666',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    backgroundColor: '#e8f4f8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    color: '#004a6f',
    fontSize: 14,
  },
});
