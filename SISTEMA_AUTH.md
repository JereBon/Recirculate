# 🔐 Sistema de Autenticación y Roles - Recirculate

## 📋 Resumen

El sistema cuenta con **2 tipos de usuarios**:
- **Administradores (6 cuentas fijas)** - Acceso al Panel de Administración
- **Clientes (ilimitados)** - Acceso a la Tienda Pública

---

## 👥 Cuentas de Administrador

Solo estas 6 cuentas tienen acceso al panel de administración:

| Nombre | Email | Contraseña |
|--------|-------|------------|
| Axel Mejias | axel@recirculate.com | Axel12300 |
| Nicolas Hassan | nicolas@recirculate.com | Nico789 |
| Loe Nuñez | loe@recirculate.com | LoeZeraNasheUwU |
| Lucho Mas | lucho@recirculate.com | RebuildHim |
| Gere Bomtorno | gere@recirculate.com | Gere468 |
| Pipo Vernier | pipo@recirculate.com | SixSeven |

---

## 🚀 Configuración Inicial

### 1. Crear los administradores en la base de datos

```bash
cd api
node create-admins.js
```

O alternativamente:

```bash
cd api
node setup-admins.js
```

Este script:
- ✅ Conecta a la base de datos PostgreSQL
- ✅ Verifica si los admins ya existen
- ✅ Crea las 6 cuentas de administrador con contraseñas hasheadas
- ✅ Muestra un resumen de los administradores creados

---

## 🔄 Flujo de Autenticación

### Para Administradores:
1. Acceder a la página principal → Redirige a `/auth/login.html`
2. Iniciar sesión con credenciales de admin
3. Sistema valida → Redirige a `/index.html` (Panel de Administración)
4. Puede acceder a:
   - Ver Productos
   - Gastos
   - Ventas
   - Auditoría
   - Tienda Pública

### Para Clientes:
1. Acceder a la página principal → Redirige a `/auth/login.html`
2. Opciones:
   - **Registrarse**: Crear cuenta nueva (automáticamente rol "cliente")
   - **Iniciar sesión**: Con cuenta existente
   - **Google Sign-In**: Autenticación con Google (automáticamente rol "cliente")
3. Sistema valida → Redirige a `/RecirculateLoe/home/home.html` (Tienda Pública)
4. Puede:
   - Ver productos
   - Añadir al carrito
   - Realizar compras

---

## 🛡️ Protecciones Implementadas

### Panel de Administración (`index.html`)
```javascript
// Verifica token y rol al cargar la página
// Si no es admin → Redirige a la tienda
// Si no tiene token → Redirige al login
```

### Login (`auth/login.js`)
```javascript
// Después del login exitoso:
// - Admin → Panel de Administración
// - Cliente → Tienda Pública
```

### Registro (`auth/registro.js`)
```javascript
// Todas las cuentas nuevas son automáticamente "cliente"
const rol = 'cliente';
```

---

## 📁 Estructura de Base de Datos

### Tabla `usuarios`
```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Tabla `clientes`
```sql
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER UNIQUE REFERENCES usuarios(id),
  telefono VARCHAR(20),
  direccion TEXT,
  fecha_nacimiento DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

## 🔧 Mantenimiento

### Agregar un nuevo administrador manualmente:

```javascript
// En create-admins.js, agregar al array:
{
  nombre: 'Nuevo Admin',
  email: 'nuevo@recirculate.com',
  password: 'Contraseña123'
}
```

Luego ejecutar:
```bash
node create-admins.js
```

### Cambiar contraseña de un admin:

```sql
-- Primero, hashear la nueva contraseña usando bcrypt
-- Luego actualizar en la base de datos:
UPDATE usuarios 
SET password = '$2a$10$...' -- Hash de la nueva contraseña
WHERE email = 'admin@recirculate.com';
```

---

## ⚠️ Notas Importantes

1. **Seguridad**: Las contraseñas están hasheadas con bcrypt (10 salt rounds)
2. **Roles fijos**: Los administradores NO pueden ser eliminados accidentalmente
3. **Google Sign-In**: Los usuarios de Google son automáticamente "clientes"
4. **Tokens**: Se almacenan en localStorage para persistencia de sesión
5. **Tabla separada**: Los clientes tienen información adicional en tabla `clientes`

---

## 🐛 Troubleshooting

### Problema: Admin no puede acceder al panel
**Solución**: Verificar que el email esté exactamente como en la lista y que el script se haya ejecutado correctamente.

### Problema: Cliente es redirigido al panel
**Solución**: Verificar el rol en la tabla `usuarios`:
```sql
SELECT email, rol FROM usuarios WHERE email = 'cliente@ejemplo.com';
```

### Problema: No se puede crear admin
**Solución**: Verificar conexión a base de datos y ejecutar:
```bash
cd api
node create-admins.js
```

---

## 📞 Soporte

Para problemas con el sistema de autenticación, verificar:
1. Logs del servidor API
2. Console del navegador (F12)
3. Estado de localStorage (Application tab en DevTools)
4. Tabla `usuarios` en PostgreSQL

---

**Última actualización**: Noviembre 2025
