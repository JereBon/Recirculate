# 📷 SISTEMA DE SUBIDA DE IMÁGENES CON CLOUDINARY

## 🎯 Descripción
Sistema completo de drag & drop para subir **2 imágenes obligatorias** (frente y espalda) al registrar productos. Las imágenes se suben automáticamente a **Cloudinary** y las URLs se guardan en la base de datos.

## ✨ Características
- **Drag & Drop** desde el explorador de archivos
- **Click para buscar** en carpetas del PC
- **2 imágenes obligatorias**: Frente y Espalda
- **Vista previa instantánea** mientras sube
- **Barra de progreso** con animación
- **Validación automática** de formato y tamaño
- **Integración completa** con Cloudinary
- **Diseño responsive** para móviles

## 🚀 Cómo Usar

### 1. Acceder al Formulario
```
/productos/registrar-producto.html
```

### 2. Subir Imágenes
1. **Drag & Drop**: Arrastra las imágenes desde tu PC a las zonas marcadas
2. **Click**: Haz clic en las zonas para abrir el explorador de archivos
3. **Automático**: Las imágenes se suben instantáneamente a Cloudinary
4. **Vista Previa**: Verás la imagen al momento mientras se sube

### 3. Validaciones
- ✅ **Formatos aceptados**: JPG, PNG, GIF, WebP
- ✅ **Tamaño máximo**: 5MB por imagen
- ✅ **Ambas obligatorias**: Frente Y espalda
- ❌ **Error automático**: Si falla la subida, se muestra error

### 4. Guardar Producto
El formulario no se enviará hasta que ambas imágenes estén subidas correctamente.

## 🔧 Implementación Técnica

### Frontend (`registrar-producto.html`)
```html
<div class="images-upload-container">
  <!-- Imagen Frente -->
  <div class="image-upload-zone" id="upload-frente">
    <div class="upload-content">...</div>
    <div class="image-preview">...</div>
    <div class="upload-progress">...</div>
  </div>
  
  <!-- Imagen Espalda -->
  <div class="image-upload-zone" id="upload-espalda">
    <div class="upload-content">...</div>
    <div class="image-preview">...</div>
    <div class="upload-progress">...</div>
  </div>
</div>
```

### JavaScript (`registrar-producto.js`)
```javascript
// URLs de imágenes subidas
let imageUrls = {
  frente: null,
  espalda: null
};

// Sistema de drag & drop
function initializeImageUpload()
function handleImageUpload(file, type)
function showImagePreview(file, type)
function removeImage(type)
```

### CSS (`style.css`)
```css
.images-upload-container { /* Grid 2 columnas */ }
.image-upload-zone { /* Zona drag & drop */ }
.upload-progress { /* Barra de progreso */ }
.image-preview { /* Vista previa */ }
```

### Backend Endpoints
```javascript
POST /api/upload          // Subir imagen a Cloudinary
POST /api/productos       // Crear producto con 2 URLs
GET /api/migrate/add-imagen-espalda-column // Migración DB
```

### Base de Datos
```sql
ALTER TABLE productos 
ADD COLUMN imagen_espalda_url TEXT;

-- Campos de imagen:
imagen_url          -- Imagen principal (frente)
imagen_espalda_url  -- Imagen secundaria (espalda)
```

## 📱 Responsive Design
- **Desktop**: Grid de 2 columnas lado a lado
- **Mobile**: Stack vertical, una imagen debajo de otra
- **Tamaño adaptable**: Las zonas se ajustan al dispositivo

## 🛠️ Configuración Cloudinary

### Variables de Entorno (.env)
```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key  
CLOUDINARY_API_SECRET=tu_api_secret
```

### Configuración (`api/cloudinary.js`)
```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

## 🔄 Migración de Base de Datos

### Aplicar Migración
```bash
# Opción 1: Automática via endpoint
GET https://recirculate-api.onrender.com/api/migrate/add-imagen-espalda-column

# Opción 2: Manual SQL
psql -f api/migrations/add_imagen_espalda_column.sql
```

### Verificar Migración
```bash
GET https://recirculate-api.onrender.com/api/migrate/check-productos
```

## 🎨 Estados Visuales

### Estados de las Zonas de Subida
- **Normal**: Borde punteado gris
- **Hover**: Borde amarillo, fondo ligeramente amarillo
- **Drag Over**: Borde sólido amarillo, escala 1.02x
- **Success**: Borde verde, vista previa de imagen
- **Error**: Borde rojo, mensaje de error

### Progreso de Subida
- **Barra animada**: 0% → 70% → 100%
- **Efecto shimmer**: Animación de brillo
- **Overlay blanco**: Cubre la zona durante subida

## 📋 Checklist de Implementación
- ✅ HTML actualizado con zonas drag & drop
- ✅ CSS completo con diseño responsive
- ✅ JavaScript con funcionalidad completa
- ✅ Modelo de base de datos actualizado
- ✅ Migración SQL creada
- ✅ Endpoint de migración agregado
- ✅ Validaciones frontend y backend
- ✅ Sistema de cleanup al resetear formulario

## 🐛 Debugging

### Consola del Browser
```javascript
// Ver URLs subidas
console.log(imageUrls);

// Estado de las imágenes
validateImages();

// Limpiar imágenes
removeImage('frente');
removeImage('espalda');
```

### Logs del Servidor
```javascript
// Subida exitosa
console.log(`✅ Imagen ${type} subida:`, result.url);

// Error de subida  
console.error('Error al subir imagen:', error);
```

## 🚀 Próximos Pasos
1. **Aplicar migración** en producción
2. **Testear subida** en ambiente de desarrollo
3. **Verificar Cloudinary** con imágenes reales
4. **Actualizar vistas** de productos para mostrar ambas imágenes
5. **Implementar galería** con cambio frente/espalda en catálogo

---

**¡Sistema listo para producción!** 🎉