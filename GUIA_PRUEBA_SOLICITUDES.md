# 📋 Guía de Prueba del Sistema de Solicitudes

## ✅ Estado Actual
- **Backend**: Corriendo en `http://localhost:5000`
- **Frontend**: Corriendo en `http://localhost:3001`
- **Base de Datos**: Conectada y configurada

## 🚀 Flujo de Prueba Completo

### 1️⃣ **Login como Cliente**
```
URL: http://localhost:3001/login
Usuario: cliente@example.com
Contraseña: 123456
```

### 2️⃣ **Agregar Productos al Carrito**
```
1. Ir a Dashboard (/Dashboard)
2. Ver lista de productos
3. Hacer clic en "Agregar" para cada producto
   - Se decrementa el stock en la BD
   - Se muestra toast verde: "producto agregado al carrito"
   - El contador "Nuevo Pedido (N)" se actualiza en la sidebar
```

### 3️⃣ **Visualizar el Carrito**
```
1. Clic en "Nuevo Pedido (N)" en la sidebar
2. Ver página /cliente/nuevo-pedido
3. Ver tabla con columnas:
   - Producto
   - Precio
   - Cantidad (con botones +/- y stock disponible)
   - Stock Disponible (badge azul)
   - Subtotal
   - Acción (botón Eliminar)
```

### 4️⃣ **Validaciones de Stock**
```
Intentar aumentar cantidad más de lo disponible:
- Se mostrará toast rojo: "Solo hay X unidades disponibles en stock"
- NO se hará la llamada al backend
- La cantidad NO se actualiza

Botones +/-:
- Hacen llamadas a PUT /api/items/:id/decrementar o /incrementar
- Actualizan el stock en la BD
- Se refleja en el badge "Stock Disponible"
```

### 5️⃣ **Procesar Pedido**
```
1. Clic en botón "Procesar Pedido" (verde)
2. Se envía POST a /api/solicitudes con:
   {
     "items": [
       { "id": 1, "nombre": "Producto", "cantidad": 2, "precio": 100 }
     ],
     "total": 200,
     "metodo_pago": "efectivo",
     "comentario": null
   }
3. En consola verás:
   - console.log de datos enviados
   - console.log del token
   - console.log de la respuesta del servidor
```

### 6️⃣ **Ver Mis Solicitudes (Cliente)**
```
1. Después de procesar pedido, se redirige a /cliente/solicitudes
2. Ver tabla con todas tus solicitudes:
   - Solicitud #123
   - Estado (pendiente, procesando, completado, cancelado)
   - Fecha formateada
   - Total
   - Método de pago
3. Clic en solicitud para expandir y ver detalles
```

### 7️⃣ **Admin Gestiona Solicitudes**
```
1. Logout y login como admin
   Usuario: admin@example.com
   Contraseña: 123456

2. Ir a /admin/solicitudes
3. Ver TODAS las solicitudes de todos los clientes:
   - Nombre del cliente
   - Teléfono del cliente
   - Dirección del cliente
   - Total, estado, fecha

4. Filtrar por estado:
   - Todas
   - Pendientes
   - Procesando
   - Completados
   - Cancelados

5. Cambiar estado:
   - Pendiente → clic "Procesar" → cambia a "Procesando"
   - Procesando → clic "Marcar Completado" → cambia a "Completado"
   - En cualquier estado → clic "Cancelar" → cambia a "Cancelado"
```

## 🔍 Verificaciones en Console (F12 → Console)

### Backend Logs
```
Solicitud recibida: { userId: 1, items: 2, total: 250 }
```

### Frontend Logs
```
Enviando pedido: {items: [...], total: 250, metodo_pago: 'efectivo', comentario: null}
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Respuesta status: 201
Solicitud creada: {message: "Solicitud creada correctamente", solicitud_id: 5, ...}
```

## ⚠️ Posibles Errores y Soluciones

### Error: "Token requerido"
```
Problema: No se está pasando el token correctamente
Solución: Verificar que localStorage tiene 'token'
  - Abrir DevTools → Storage → LocalStorage
  - Debe haber: token, roleId, userId
```

### Error: "Usuario no autenticado"
```
Problema: userId no se extrae del token
Solución: Verificar que verificarToken() retorna {id, ...}
  - Revisar utils/jwt.js
  - Debe decodificar correctamente el JWT
```

### Error: "La solicitud debe contener al menos un producto"
```
Problema: El array items está vacío o null
Solución: Asegurar que carrito tiene items
  - Verificar que se agregaron productos al carrito
  - Comprobar que localStorage['carrito'] tiene datos
```

### Error: "CORS" o "Failed to fetch"
```
Problema: El backend no está corriendo o CORS está mal
Solución:
  1. Verificar que backend corre: http://localhost:5000 en navegador
  2. Debe mostrar un error JSON (es normal, confirma que corre)
  3. Verificar que server.js tiene: app.use(cors())
```

## 📊 Estructura de Datos Guardados

### En tabla `solicitudes`:
```
id: 1
user_id: 2 (cliente que hizo la solicitud)
fecha: 2025-11-12 10:30:45
estado: 'pendiente'
total: 250.00
metodo_pago: 'efectivo'
comentario: null
```

### En tabla `detalle-solicitud`:
```
id: 1
solicitud_id: 1
item_id: 3
cantidad: 2
precio_unitario: 125.00
```

## 🎯 Resumen de Endpoints

```
POST   /api/solicitudes              Crear solicitud
GET    /api/solicitudes              Todas (ADMIN)
GET    /api/solicitudes/mis-solicitudes  Del usuario (CLIENTE)
GET    /api/solicitudes/:id          Detalles específicos
PUT    /api/solicitudes/:id/estado   Cambiar estado
PUT    /api/solicitudes/:id/comentario Agregar comentario
```

## ✨ Características Implementadas

✅ Registro de solicitudes con datos del cliente  
✅ Nombre del cliente guardado  
✅ Teléfono del cliente guardado  
✅ Dirección del cliente guardada  
✅ Admin puede ver todas las solicitudes  
✅ Cliente puede ver solo sus solicitudes  
✅ Cambio de estado (pendiente → procesando → completado)  
✅ Validación de stock en carrito  
✅ Toast notifications para feedback  
✅ Filtros por estado en admin  
✅ Información completa del cliente en admin  
✅ Redirección automática a /cliente/solicitudes después de procesar  

---

**¡Si todo funciona, el sistema está listo para producción! 🎉**
