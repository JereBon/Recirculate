# 🛍️ Recirculate - E-commerce de Ropa Circular

Sistema completo de e-commerce con gestión de productos, carrito de compras, autenticación de usuarios y panel de administración.

---

## 🌐 **DEMO EN VIVO**

### 🔗 **Sitio Web (Frontend):**
**Próximamente:** Se desplegará en Netlify

### 🔗 **API (Backend):**
**URL:** https://recirculate-api.onrender.com

---

## 👤 **CREDENCIALES DE PRUEBA**

### Usuario Administrador:
- **Email:** `admin@recirculate.com`
- **Password:** `admin123`

### Funciones del Admin:
- ✅ Gestión completa de productos (agregar, editar, eliminar)
- ✅ Ver ventas y estadísticas
- ✅ Gestión de inventario y stock
- ✅ Registro de gastos
- ✅ Auditoría de cambios

### Usuario Regular:
- ✅ Explorar catálogo de productos
- ✅ Búsqueda global en tiempo real
- ✅ Carrito de compras
- ✅ Sistema de talles con stock en tiempo real
- ✅ Registro y login de usuarios

---

## 🛠️ **TECNOLOGÍAS UTILIZADAS**

### **Backend:**
- Node.js + Express.js
- PostgreSQL (Base de datos)
- JWT Authentication
- Cloudinary (Almacenamiento de imágenes)
- Bcrypt (Encriptación de contraseñas)
- Desplegado en **Render**

### **Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Diseño Responsive (Mobile-first)
- API REST consumption
- Sistema de búsqueda global
- Galería de imágenes interactiva

---

## ✨ **CARACTERÍSTICAS PRINCIPALES**

### 🏪 **Catálogo Público:**
- ✅ Catálogo dinámico conectado a la API
- ✅ Filtrado por categorías (Hombre, Mujer, Unisex)
- ✅ Búsqueda global desde cualquier página
- ✅ Sistema de talles con disponibilidad en tiempo real
- ✅ Galería de imágenes (vista frontal y trasera)
- ✅ Carrito de compras persistente

### 📊 **Panel de Administración:**
- ✅ Dashboard con estadísticas
- ✅ Gestión de productos con imágenes
- ✅ Control de stock por talle
- ✅ Registro de ventas
- ✅ Gestión de gastos
- ✅ Sistema de auditoría

### 🔐 **Autenticación:**
- ✅ Login/Registro de usuarios
- ✅ Tokens JWT
- ✅ Roles de usuario (Admin/Cliente)
- ✅ Sesiones persistentes

---

## 📁 **ESTRUCTURA DEL PROYECTO**

```
Recirculate/
├── api/                          # Backend (Node.js + Express)
│   ├── models/                   # Modelos de base de datos
│   ├── routes/                   # Rutas de la API
│   ├── middleware/               # Autenticación y validación
│   ├── services/                 # Servicios (email, etc.)
│   └── server.js                 # Servidor principal
│
├── RecirculateLoe/               # Frontend (Cliente público)
│   ├── home/                     # Página de inicio
│   ├── pages/                    # Páginas de categorías
│   ├── productos/                # Páginas de productos individuales
│   ├── carrito/                  # Carrito de compras
│   ├── auth/                     # Login y registro
│   └── assets/                   # CSS, JS, imágenes
│
├── productos/                    # Panel de administración
├── ventas/                       # Gestión de ventas
└── gastos/                       # Gestión de gastos
```

---

## 🚀 **CÓMO PROBAR EL PROYECTO LOCALMENTE**

### **Opción 1: Usar el sitio desplegado (Más fácil)**
1. Visitar la URL del sitio web desplegado (ver arriba)
2. Usar las credenciales de prueba
3. ¡Listo! Ya puedes explorar

### **Opción 2: Ejecutar localmente**

#### 1. Clonar el repositorio:
```bash
git clone https://github.com/JereBon/Recirculate.git
cd Recirculate
git checkout fusion-base-limpia
```

#### 2. Abrir el sitio web:
```bash
# Opción A: Abrir directamente el archivo HTML
# Navegar a: RecirculateLoe/home/home.html

# Opción B: Usar un servidor local (recomendado)
# Con Python:
python -m http.server 8000

# Con Node.js:
npx http-server

# Luego abrir: http://localhost:8000/RecirculateLoe/home/home.html
```

#### 3. (Opcional) Ejecutar el backend localmente:
```bash
cd api
npm install

# Crear archivo .env con:
DATABASE_URL=postgresql://user:password@localhost:5432/recirculate
JWT_SECRET=tu_jwt_secret_aqui
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

npm start
```

**Nota:** El backend ya está desplegado en Render, por lo que no es necesario ejecutarlo localmente.

---

## 📦 **DATOS DE PRUEBA**

La base de datos incluye:
- **45 productos** distribuidos en:
  - 6 Buzos (Unisex)
  - 3 Remeras (Hombre)
  - 6 Remeras/Tops (Mujer)
  - 6 Pantalones (Hombre)
  - 6 Camperas (Hombre)
  - 6 Camisas (Hombre)
  - 6 Vestidos/Monos (Mujer)
  - 6 Polleras/Shorts (Mujer)

Todos los productos tienen:
- ✅ Stock real por talle (S, M, L, XL)
- ✅ Imágenes en Cloudinary
- ✅ Precios actualizados
- ✅ Sistema de disponibilidad en tiempo real

---

## 🎨 **FUNCIONALIDADES DESTACADAS**

### 🔍 **Búsqueda Global:**
- Sistema de búsqueda que funciona desde cualquier página
- Busca por nombre, categoría y género
- Resultados en tiempo real desde la API
- Navegación directa al producto

### 🛒 **Carrito de Compras:**
- Persistencia en localStorage
- Actualización de stock en tiempo real
- Validación de disponibilidad
- Contador en el header

### 👗 **Sistema de Talles:**
- Botones de talle con stock visible
- Talles no disponibles deshabilitados
- Validación al agregar al carrito
- Stock actualizado desde la base de datos

### 📱 **Responsive Design:**
- Mobile-first approach
- Adaptable a tablets y desktop
- Sidebar navigation
- Menú hamburguesa en móviles

---

## 📸 **SCREENSHOTS**

### Vista de Catálogo:
Productos organizados por categorías con imágenes hover

### Detalle de Producto:
- Galería de imágenes
- Selector de talles con stock
- Información completa del producto
- Breadcrumbs de navegación

### Panel de Administración:
- Dashboard con estadísticas
- CRUD completo de productos
- Gestión de inventario

---

## 🔒 **SEGURIDAD**

- ✅ Autenticación JWT
- ✅ Contraseñas encriptadas con Bcrypt
- ✅ Validación de datos en backend
- ✅ Protección de rutas administrativas
- ✅ Variables de entorno para credenciales
- ✅ CORS configurado

---

## 📞 **CONTACTO**

- **GitHub:** [JereBon](https://github.com/JereBon)
- **Repositorio:** [Recirculate](https://github.com/JereBon/Recirculate)

---

## 📄 **LICENCIA**

Este proyecto fue desarrollado como trabajo final para la materia de Laboratorio de Computación III.

**Año:** 2025  
**Universidad:** Universidad Tecnológica Nacional

---

## ⚠️ **NOTA PARA EL PROFESOR**

Este proyecto está completamente funcional y desplegado en producción:

1. **Frontend:** Desplegado en Netlify (sitio estático)
2. **Backend:** Desplegado en Render (API REST)
3. **Base de datos:** PostgreSQL en Render
4. **Imágenes:** Cloudinary

**No es necesario instalar nada localmente.** Solo visitar la URL del sitio desplegado y usar las credenciales de prueba.

Si desea revisar el código fuente, puede clonar el repositorio desde GitHub (rama: `fusion-base-limpia`).

---

**¡Gracias por revisar el proyecto! 🚀**
