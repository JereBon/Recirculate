# Recirculate - Sistema de Gestión

Sistema completo de gestión de productos, ventas y gastos con autenticación de usuarios.

## 🛠️ Tecnologías

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Cloudinary (imágenes)
- Socket.io

**Frontend:**
- HTML5, CSS3, JavaScript vanilla
- Responsive design
- Real-time updates

## 🔧 Instalación local

```bash
cd api
npm install
npm start
```

## 🌐 Configuración

Crear archivo `.env` en la carpeta `api`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/recirculate
JWT_SECRET=tu_jwt_secret_aqui
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## 👤 Usuario por defecto

- **Email:** admin@recirculate.com
- **Password:** admin123
- **Rol:** Administrador



Compatible con Render, Vercel, Netlify y otras plataformas.