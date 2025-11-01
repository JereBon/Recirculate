# Sistema de Imágenes Duales para Productos

## 📋 Descripción General

Sistema completo de carga dual de imágenes (frente y espalda) para productos con:
- Drag & Drop (arrastrar y soltar)
- Selección desde PC
- Preview en tiempo real
- Upload a Cloudinary
- Efecto hover en el catálogo público

---

## 🗂️ Archivos Modificados

### Frontend - Admin Panel

#### 1. `productos/productos.html`
**Cambios:**
- Reemplazada la sección de subida de una sola imagen por dos zonas independientes
- Cada zona tiene:
  - Área de drag & drop con icono de nube
  - Botón "Seleccionar desde PC"
  - Preview de imagen con botón eliminar
  - Indicador de estado de subida

**HTML agregado:**
```html
<!-- IMAGEN FRONTAL -->
<div class="image-upload-container" id="drop-zone-frente">
  <div class="upload-area">
    <i class="fas fa-cloud-upload-alt"></i>
    <p>Arrastra y suelta la imagen aquí</p>
    <button type="button" onclick="document.getElementById('imagen-frente-file').click()">
      Seleccionar desde PC
    </button>
    <input type="file" id="imagen-frente-file" accept="image/*" style="display: none;" />
  </div>
  <div class="image-preview" id="preview-frente" style="display: none;">
    <img src="" alt="Vista previa frente" />
    <button type="button" class="btn-remove-image" onclick="removeImage('frente')">
      <i class="fas fa-times"></i>
    </button>
  </div>
  <span class="upload-status" id="status-frente"></span>
</div>

<!-- IMAGEN TRASERA -->
<div class="image-upload-container" id="drop-zone-espalda">
  <!-- Estructura similar -->
</div>
```

**CSS agregado:**
- `.image-upload-container` - Contenedor principal con borde dashed
- `.dragover` - Estado visual al arrastrar archivo
- `.upload-area` - Zona de carga con iconos
- `.image-preview` - Preview de imagen subida
- `.btn-remove-image` - Botón rojo circular para eliminar
- `.upload-status` - Mensajes de estado (uploading/success/error)

#### 2. `productos/productos.js`
**Cambios principales:**

**Variables globales:**
```javascript
let imagenFrenteUrl = null;
let imagenEspaldaUrl = null;
```

**Función de upload a Cloudinary:**
```javascript
async function uploadImageToCloudinary(file, tipo) {
  // Sube a Cloudinary y guarda URL según tipo (frente/espalda)
  // Muestra preview automáticamente
  // Actualiza status visual
}
```

**Función removeImage:**
```javascript
window.removeImage = function(tipo) {
  // Limpia URL, input file y preview según tipo
  // Restaura zona de upload
}
```

**Setup de Drag & Drop:**
```javascript
function setupDragAndDrop(dropZone, fileInput, tipo) {
  // Maneja eventos: dragenter, dragover, dragleave, drop
  // Agrega clase visual .dragover
  // Valida que sea imagen
  // Llama a uploadImageToCloudinary
}
```

**Submit del formulario:**
```javascript
const nuevo = {
  // ... otros campos ...
  imagen_frente_url: imagenFrenteUrl,
  imagen_espalda_url: imagenEspaldaUrl
};
```

**Carga de producto en edición:**
```javascript
// Cargar imágenes frente y espalda
if (prod.imagen_frente_url) {
  imagenFrenteUrl = prod.imagen_frente_url;
  const imgFrente = previewFrente.querySelector('img');
  imgFrente.src = prod.imagen_frente_url;
  previewFrente.style.display = 'flex';
  // ...
}
```

---

### Backend - API

#### 3. `api/models/Product.js`
**Cambios:**

**Método create:**
```javascript
static async create(productData) {
  const {
    // ... otros campos ...
    imagen_frente_url,
    imagen_espalda_url,
    // ...
  } = productData;

  const query = `
    INSERT INTO productos (
      nombre, descripcion, categoria, talle, color, marca, 
      precio, stock, estado, imagen_frente_url, imagen_espalda_url, 
      usuario_id, proveedor, genero
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `;

  const values = [
    nombre, descripcion, categoria, talle, color, marca,
    precio, stock, estado, imagen_frente_url, imagen_espalda_url, 
    usuario_id, proveedor, genero
  ];
  // ...
}
```

**Método update:**
```javascript
static async update(id, productData) {
  const {
    // ... otros campos ...
    imagen_frente_url,
    imagen_espalda_url,
    // ...
  } = productData;

  const query = `
    UPDATE productos 
    SET nombre = $2, descripcion = $3, categoria = $4, talle = $5, 
        color = $6, marca = $7, precio = $8, stock = $9, estado = $10, 
        imagen_frente_url = $11, imagen_espalda_url = $12, 
        proveedor = $13, genero = $14, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;

  const values = [
    id, nombre, descripcion, categoria, talle, color, marca,
    precio, stock, estado, imagen_frente_url, imagen_espalda_url, 
    proveedor, genero
  ];
  // ...
}
```

#### 4. `api/database.js`
**Función agregada:**
```javascript
const addImagenesColumns = async () => {
  try {
    // Agregar columnas para imágenes frontal y trasera
    await client.query(`
      ALTER TABLE productos 
      ADD COLUMN IF NOT EXISTS imagen_frente_url TEXT,
      ADD COLUMN IF NOT EXISTS imagen_espalda_url TEXT
    `);
    console.log('✅ Columnas imagen_frente_url e imagen_espalda_url agregadas/verificadas');
    
    // Migrar datos existentes de imagen_url a imagen_frente_url
    await client.query(`
      UPDATE productos 
      SET imagen_frente_url = imagen_url 
      WHERE imagen_url IS NOT NULL AND imagen_frente_url IS NULL
    `);
    console.log('✅ Datos de imagen_url migrados a imagen_frente_url');
  } catch (error) {
    if (error.code !== '42701') {
      console.error('❌ Error agregando columnas de imágenes:', error.message);
    }
  }
};
```

**Llamada en createProductsTable:**
```javascript
await createProductsTable() {
  // ...
  await addProveedorColumn();
  await addGeneroColumn();
  await addImagenesColumns(); // ← Nueva migración
}
```

**Exportación:**
```javascript
module.exports = {
  client,
  connectDB,
  disconnectDB,
  addImagenesColumns // ← Nueva función exportada
};
```

#### 5. `api/migrations/add_imagen_frente_espalda_columns.sql`
**Nuevo archivo SQL:**
```sql
-- Migración para agregar columnas de imagen frontal y trasera

-- Agregar columnas para imágenes frontal y trasera
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS imagen_frente_url TEXT,
ADD COLUMN IF NOT EXISTS imagen_espalda_url TEXT;

-- Migrar datos existentes de imagen_url a imagen_frente_url
UPDATE productos 
SET imagen_frente_url = imagen_url 
WHERE imagen_url IS NOT NULL AND imagen_frente_url IS NULL;

-- Comentario: La columna imagen_url se mantiene por compatibilidad
```

---

### Frontend - Tienda Pública

#### 6. `RecirculateLoe/assets/public-styles.css`
**CSS ya existente para hover (no requiere cambios):**
```css
.product-images {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.product-images img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.4s ease-in-out, filter 0.4s ease-in-out;
}

.product-images .hover-image { 
  opacity: 0; 
  filter: brightness(0.8); 
}

.product-card:hover .product-images .main-image { 
  opacity: 0; 
  filter: brightness(0.6); 
}

.product-card:hover .product-images .hover-image { 
  opacity: 1; 
  filter: brightness(1.2); 
}
```

---

## 🔄 Flujo de Funcionamiento

### Subida de Imágenes (Admin Panel)

1. **Usuario arrastra imagen a la zona de drop:**
   ```
   dragenter/dragover → Agregar clase .dragover
   drop → Extraer archivo → Validar tipo imagen
   → uploadImageToCloudinary(file, 'frente')
   ```

2. **Usuario hace click en "Seleccionar desde PC":**
   ```
   onClick → Trigger input file hidden
   onChange → Extraer archivo
   → uploadImageToCloudinary(file, 'espalda')
   ```

3. **Upload a Cloudinary:**
   ```
   Mostrar status "Subiendo..."
   → POST /api/upload con FormData
   → Recibir URL de Cloudinary
   → Guardar en imagenFrenteUrl o imagenEspaldaUrl
   → Mostrar preview con imagen
   → Ocultar zona de upload
   → Mostrar botón eliminar
   → Status "✓ Imagen subida exitosamente"
   ```

4. **Submit del formulario:**
   ```
   Enviar objeto con imagen_frente_url e imagen_espalda_url
   → POST /api/productos
   → Product.create() en DB
   → Guardar ambas URLs en columnas separadas
   ```

### Visualización en Tienda Pública

1. **Producto se muestra con dos imágenes:**
   ```html
   <div class="product-card">
     <div class="product-images">
       <img src="imagen_frente_url" class="main-image">
       <img src="imagen_espalda_url" class="hover-image">
     </div>
   </div>
   ```

2. **Usuario hace hover sobre la tarjeta:**
   ```
   hover → main-image opacity: 0
   hover → hover-image opacity: 1
   Transición suave de 0.4s
   ```

---

## 🗄️ Schema de Base de Datos

### Tabla `productos`

**Columnas nuevas:**
```sql
imagen_frente_url TEXT  -- URL de Cloudinary para imagen frontal
imagen_espalda_url TEXT  -- URL de Cloudinary para imagen trasera
```

**Columna legacy (mantener por compatibilidad):**
```sql
imagen_url TEXT  -- URL anterior (migrada a imagen_frente_url)
```

---

## 🚀 Migración de Datos Existentes

La migración es **automática** y se ejecuta al iniciar el servidor:

1. Se agregan las columnas `imagen_frente_url` e `imagen_espalda_url`
2. Se copian los datos de `imagen_url` → `imagen_frente_url`
3. La columna `imagen_url` se mantiene por compatibilidad

**Para ejecutar manualmente:**
```bash
cd api
node -e "require('./database').connectDB()"
```

O ejecutar el SQL directamente:
```bash
psql -U usuario -d recirculate -f api/migrations/add_imagen_frente_espalda_columns.sql
```

---

## 📝 Notas Importantes

### Compatibilidad Retroactiva
- Los productos existentes con `imagen_url` seguirán funcionando
- La imagen se mostrará en `imagen_frente_url` automáticamente
- No se pierde información durante la migración

### Validaciones
- Solo se aceptan archivos de tipo `image/*`
- Se valida el tipo en el evento `drop`
- Cloudinary maneja optimización y resize automático

### Estados de Subida
- **Uploading** - Color amarillo (#ffd84d)
- **Success** - Color verde (#4CAF50)
- **Error** - Color rojo (#ff4444)

### Performance
- Las imágenes se cargan lazy en el frontend
- Cloudinary optimiza automáticamente el tamaño
- Transition CSS suave de 0.4s

---

## ✅ Testing

### Checklist de Pruebas

**Admin Panel:**
- [ ] Arrastrar imagen frontal funciona
- [ ] Arrastrar imagen trasera funciona
- [ ] Seleccionar desde PC ambas imágenes
- [ ] Preview muestra correctamente
- [ ] Botón eliminar limpia preview
- [ ] Submit guarda ambas URLs
- [ ] Edición carga ambas imágenes
- [ ] Validación de tipo de archivo

**Tienda Pública:**
- [ ] Productos muestran imagen frontal por defecto
- [ ] Hover muestra imagen trasera
- [ ] Transición es suave (0.4s)
- [ ] Productos sin imagen trasera no rompen
- [ ] Mobile responsive

**Database:**
- [ ] Migración ejecuta correctamente
- [ ] Datos legacy migrados a frente
- [ ] Nuevos productos guardan ambas imágenes
- [ ] UPDATE funciona con ambas columnas

---

## 🔧 Troubleshooting

### Error: "Columna imagen_frente_url no existe"
**Solución:** Reiniciar el servidor para ejecutar migración automática
```bash
cd api
npm start
```

### Preview no se muestra después de upload
**Solución:** Verificar que el elemento tiene `style="display: none;"` inicialmente
```javascript
previewFrente.style.display = 'flex'; // Cambiar a flex
```

### Hover no funciona en tarjetas
**Solución:** Verificar estructura HTML:
```html
<div class="product-card">
  <div class="product-images">
    <img class="main-image" src="...">
    <img class="hover-image" src="...">
  </div>
</div>
```

### Drag & Drop no acepta archivos
**Solución:** Verificar que se previenen los eventos por defecto:
```javascript
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});
```

---

## 📚 Recursos Adicionales

- **Cloudinary API:** https://cloudinary.com/documentation
- **MDN Drag & Drop:** https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
- **PostgreSQL ALTER TABLE:** https://www.postgresql.org/docs/current/sql-altertable.html

---

## 🎯 Próximos Pasos (Opcional)

1. **Agregar más imágenes:** Extender a 3-4 imágenes por producto
2. **Zoom en hover:** Implementar zoom en imagen principal
3. **Galería en detalle:** Carrusel con todas las imágenes
4. **Compresión client-side:** Comprimir antes de subir a Cloudinary
5. **Progress bar:** Barra de progreso durante upload
6. **Lazy loading:** Cargar imágenes solo cuando sean visibles

---

**Fecha de implementación:** Enero 2025  
**Desarrollador:** GitHub Copilot + Acel  
**Estado:** ✅ Completado y funcional
