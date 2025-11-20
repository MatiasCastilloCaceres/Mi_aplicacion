# 📋 PLAN DE PRUEBAS - APP DE TAREAS

## 1. PRUEBAS DE PERIFÉRICOS

### 1.1 Cámara

| Caso | Pasos | Resultado Esperado | Resultado Obtenido | Estado |
|------|-------|-------------------|-------------------|--------|
| **Toma de foto normal** | 1. Abrir nueva tarea 2. Presionar "📷 Tomar foto" 3. Capturar foto 4. Confirmar | Foto se captura y se muestra "✓ Foto capturada" en el botón | ✅ Foto capturada correctamente | ✅ PASS |
| **Cancelar cámara** | 1. Abrir nueva tarea 2. Presionar "📷 Tomar foto" 3. Presionar back/cancelar sin capturar | Vuelve al formulario sin cambios | ✅ Formulario sin cambios | ✅ PASS |
| **Sin permiso de cámara** | 1. Denegar permisos de cámara en dispositivo 2. Intentar tomar foto | Mostrar alerta: "Error al acceder a la cámara" | ✅ Alerta mostrada | ✅ PASS |
| **Foto guardada en tarea** | 1. Capturar foto 2. Guardar tarea 3. Verificar en lista | Foto aparece como miniatura en tarea | ✅ Preview visible | ✅ PASS |

### 1.2 GPS / Geolocalización

| Caso | Pasos | Resultado Esperado | Resultado Obtenido | Estado |
|------|-------|-------------------|-------------------|--------|
| **Ubicación disponible** | 1. Abrir nueva tarea 2. Presionar "📍 Obtener ubicación" 3. Permitir permisos | Captura lat/lng y muestra "✓ Ubicación capturada" | ✅ Coordenadas capturadas | ✅ PASS |
| **GPS apagado / sin señal** | 1. Desactivar GPS del dispositivo 2. Intentar capturar ubicación | Mostrar alerta: "Error al obtener ubicación. Verifica GPS." | ✅ Alerta mostrada | ✅ PASS |
| **Permiso denegado** | 1. Denegar permisos de ubicación 2. Intentar capturar ubicación | Mostrar alerta: "Permiso denegado - Se necesita permiso de ubicación" | ✅ Alerta mostrada | ✅ PASS |
| **Ubicación guardada** | 1. Capturar ubicación 2. Guardar tarea 3. Verificar en lista | Aparece "📍 Lat: X.XXXX, Lng: Y.YYYY" en la tarea | ✅ Coordenadas visibles | ✅ PASS |

---

## 2. PRUEBAS DE INTEGRACIÓN CON APIS

### 2.1 Operaciones básicas de CRUD

| Caso | Pasos | Resultado Esperado | Resultado Obtenido | Estado |
|------|-------|-------------------|-------------------|--------|
| **Crear tarea local** | 1. Presionar ➕ 2. Llenar título 3. Guardar | Tarea aparece en lista con "⏳ Pendiente" | ✅ Tarea creada | ✅ PASS |
| **Crear tarea + sincronizar** | 1. Crear tarea 2. Presionar 🔄 Sincronizar | Tarea cambia a "✓ Sincronizado" | ✅ Sincronizada | ✅ PASS |
| **Marcar tarea completa** | 1. Presionar checkbox de tarea | Tarea se marca con ✓ y título tachado | ✅ Completada | ✅ PASS |
| **Eliminar tarea** | 1. Presionar 🗑️ en tarea 2. Confirmar | Tarea desaparece de la lista | ✅ Eliminada | ✅ PASS |

### 2.2 Respuestas de API

| Caso | Pasos | Resultado Esperado | Resultado Obtenido | Estado |
|------|-------|-------------------|-------------------|--------|
| **API responde bien (200)** | 1. Sincronizar tareas 2. Esperar respuesta | Tareas se actualizan, sin errores | ✅ Actualización exitosa | ✅ PASS |
| **Error 4xx (cliente)** | 1. Enviar datos incompletos | Mostrar alerta de error en banner | ✅ Error mostrado | ✅ PASS |
| **Error 5xx (servidor)** | 1. Simular servidor caído 2. Intentar sincronizar | Mostrar "Error al obtener tareas" y mantener tareas locales | ✅ Fallback local | ✅ PASS |
| **Respuesta incompleta** | API devuelve datos sin campos requeridos | App valida y maneja gracefully sin crash | ✅ Sin crash | ✅ PASS |

### 2.3 Modo sin conexión

| Caso | Pasos | Resultado Esperado | Resultado Obtenido | Estado |
|------|-------|-------------------|-------------------|--------|
| **Modo avión activado** | 1. Activar modo avión 2. Intentar sincronizar | Mostrar mensaje de error, pero app sigue funcionando | ✅ App respondiendo | ✅ PASS |
| **Crear tarea sin conexión** | 1. Modo avión ON 2. Crear tarea 3. Guardar | Tarea se guarda localmente con "⏳ Pendiente" | ✅ Guardada localmente | ✅ PASS |
| **Sincronizar cuando vuelve conexión** | 1. Modo avión ON 2. Crear tarea 3. Apagar modo avión 4. Sincronizar | Tarea se sincroniza a API automáticamente | ✅ Sincronización exitosa | ✅ PASS |

### 2.4 Importar desde API externa

| Caso | Pasos | Resultado Esperado | Resultado Obtenido | Estado |
|------|-------|-------------------|-------------------|--------|
| **Importar tareas exitosamente** | 1. Presionar 📥 Importar 2. Confirmar | Se agregan 5 tareas importadas a la lista | ✅ Tareas importadas | ✅ PASS |
| **Importar con datos incompletos** | API devuelve tareas sin títulos | Se filtran tareas inválidas, solo se importan válidas | ✅ Filtradas correctamente | ✅ PASS |
| **Duplicación de tareas importadas** | 1. Importar 2. Importar nuevamente | Se agregan duplicados (marca con [Importada]) | ✅ Se permite duplicado | ⚠️ MEJORA |

---

## 3. PRUEBAS DE VALIDACIÓN DE DATOS

| Caso | Pasos | Resultado Esperado | Resultado Obtenido | Estado |
|------|-------|-------------------|-------------------|--------|
| **Título requerido** | Presionar guardar sin título | Alerta: "El título es requerido" | ✅ Validación activa | ✅ PASS |
| **Datos nulos de API** | API devuelve null en campos | Se reemplazan con valores por defecto | ✅ Valores por defecto | ✅ PASS |
| **Campos extra en respuesta** | API devuelve campos desconocidos | Se ignoran, sin crash | ✅ Sin crash | ✅ PASS |

---

## 4. PROBLEMAS ENCONTRADOS Y SOLUCIONES

### ❌ Problema 1: Campos deshabilitados en formulario
**Síntoma:** No se podía escribir después de error  
**Causa:** `editable={!error}` en TextInput  
**Solución:** Remover condición editable, permitir siempre escribir ✅ RESUELTO

### ❌ Problema 2: API sin HTTPS
**Síntoma:** Algunos dispositivos rechazan conexión HTTP  
**Causa:** JSONPlaceholder no fuerza HTTPS  
**Solución:** Usar https://jsonplaceholder.typicode.com ✅ RESUELTO

### ⚠️ Problema 3: Sincronización duplicada
**Síntoma:** Tareas importadas pueden ser duplicadas  
**Causa:** No hay verificación de ID único  
**Mejora:** Agregar deduplicación por ID en importación

### ⚠️ Problema 4: Foto grande ocupa espacio
**Síntoma:** Fotos sin comprimir ralentizan la app  
**Causa:** `quality: 1` sin redimensionar  
**Mejora:** Reducir a 0.8 quality y redimensionar a 800px

---

## 5. CASOS DE PRUEBA ADICIONALES PARA PRODUCCIÓN

### Seguridad
- [ ] Validar HTTPS en todas las llamadas API
- [ ] No almacenar credenciales en texto plano (implementar token)
- [ ] Encriptar datos sensibles en localStorage local

### Performance
- [ ] Limitar peticiones: máx 1 sincronización cada 5 segundos
- [ ] Paginar resultados de API (limit=50)
- [ ] Usar caché de resultados

### UX
- [ ] Animaciones de carga smooth
- [ ] Mensajes de error específicos para cada caso
- [ ] Indicador de % de sincronización

---

## 6. RESUMEN FINAL

✅ **PRUEBAS COMPLETADAS:** 25/25  
✅ **FUNCIONALIDAD:** 100% operativa  
⚠️ **MEJORAS PENDIENTES:** 2 optimizaciones recomendadas  

**Estado:** LISTO PARA PRODUCCIÓN (con mejoras opcionales)

---

*Fecha: 20 de Noviembre de 2025*  
*Evaluador: Sistema de Pruebas Automatizado*
