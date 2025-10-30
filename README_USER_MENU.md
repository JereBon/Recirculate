# Sistema de Menú de Usuario y Historial de Visitas - Recirculate

## 🎯 Características Implementadas

### ✅ Menú Desplegable de Usuario
- **Activación**: Click en el ícono de persona (solo cuando está logueado)
- **Opciones disponibles**:
  - 🏠 **Volver al Inicio**: Navega a home.html
  - 🚪 **Cerrar Sesión**: Elimina datos de usuario y redirige al login
  - 📋 **Historial de Visitas**: Mini carrusel con últimas 5 prendas visitadas

### ✅ Diseño Consistente
- **Colores**: Mantiene la paleta de Recirculate (#ffd84d, #222, #fafafa)
- **Tipografía**: Fuente Poppins consistente
- **Header visible**: El menú se superpone sin ocultar el header
- **Responsive**: Se adapta correctamente en dispositivos móviles

### ✅ Historial de Visitas Inteligente
- **Tracking automático**: Registra productos visitados solo para usuarios logueados
- **Mini carrusel horizontal**: Scroll suave con las últimas 5 prendas
- **Información completa**: Imagen, nombre y precio de cada producto
- **No duplicados**: Si visitas el mismo producto, se mueve al inicio
- **Persistencia**: Se guarda en localStorage del navegador

### ✅ Integración con Sistema Existente
- **Verificación JWT**: Valida tokens de autenticación reales
- **Estado de login**: Detecta automáticamente si el usuario está logueado
- **Limpieza automática**: Elimina datos cuando el token expira

## 🚀 Archivos Modificados/Creados

### Nuevos Archivos
- `RecirculateLoe/assets/user-menu.js` - Sistema completo del menú de usuario
- `README_USER_MENU.md` - Esta documentación

### Archivos Modificados
- `RecirculateLoe/assets/public-styles.css` - Estilos del menú desplegable
- `RecirculateLoe/home/home.html` - Integración del script + botones de prueba
- `RecirculateLoe/home/home.js` - Tracking de clicks en carrusel de destacados
- `RecirculateLoe/assets/pages.js` - Tracking de clicks en páginas de categorías
- `RecirculateLoe/pages/hombre/hombre.html` - Integración del script
- `RecirculateLoe/pages/mujer/mujer.html` - Integración del script
- `RecirculateLoe/pages/remeras/remeras.html` - Integración del script

## 🧪 Testing y Desarrollo

### Botones de Prueba Temporales
En `home.html` hay botones de prueba (esquina inferior izquierda):
- **🔑 Test Login**: Simula login con usuario de prueba
- **🚪 Test Logout**: Simula logout y limpia datos

### Probar el Sistema
1. Abrir `RecirculateLoe/home/home.html`
2. Click en "🔑 Test Login" para simular login
3. El ícono de persona ahora es clickeable
4. Click en productos del carrusel para agregar al historial
5. Navegar a páginas de categorías y click en productos
6. Verificar que aparecen en el historial del menú de usuario

## 💻 Uso en Producción

### Integración con Sistema Real de Login
```javascript
// En tu sistema de login exitoso, guardar:
localStorage.setItem('token', jwtToken);
localStorage.setItem('userData', JSON.stringify(userData));

// El UserMenuManager detectará automáticamente el login
```

### Agregar a Nuevas Páginas
```html
<!-- Antes de cerrar </body> -->
<script src="../../assets/user-menu.js"></script>
```

### Tracking Manual de Productos
```javascript
// Para rastrear visita manual a un producto
if (window.userMenuManager && window.userMenuManager.isLoggedIn) {
    const productData = {
        id: producto.id,
        nombre: producto.nombre,
        imagen_url: producto.imagen_url,
        precio: producto.precio,
        categoria: producto.categoria
    };
    
    window.userMenuManager.trackProductVisit(productData);
}
```

## 🎨 Personalización de Estilos

Los estilos del menú están en `public-styles.css` bajo la sección "Menu Desplegable de Usuario". Puedes modificar:

- **Colores**: Variables de background, border, texto
- **Tamaño**: width del menú (actualmente 320px)
- **Posición**: top, right para ajustar posición
- **Animaciones**: transitions y hover effects

## 🔧 Estructura del Código

### Clases Principales
- `UserMenuManager`: Clase principal que maneja todo el sistema
- `checkLoginStatus()`: Verifica autenticación JWT
- `createUserMenu()`: Genera HTML del menú dinámicamente
- `trackProductVisit()`: Registra visitas de productos
- `renderVisitHistory()`: Actualiza el carrusel visual

### Almacenamiento Local
- `token`: JWT de autenticación
- `userData`: Información del usuario logueado
- `visitHistory`: Array con últimas 5 visitas

## 🚀 Funcionalidades Futuras Sugeridas

1. **Favoritos**: Botón de corazón en productos para guardar favoritos
2. **Comparador**: Agregar productos para comparar lado a lado
3. **Notificaciones**: Avisos de descuentos en productos del historial
4. **Recomendaciones**: Sugerir productos similares basados en historial
5. **Compartir**: Botones para compartir productos en redes sociales

## 🐛 Debugging

### Console Logs Útiles
El sistema incluye logs en consola para debugging:
- ✅ Login/logout exitoso
- 📝 Productos agregados al historial
- ⚠️ Errores de autenticación
- 🔍 Estado del menú (abierto/cerrado)

### Verificar Estado
```javascript
// En consola del navegador
console.log('¿Logueado?', window.userMenuManager?.isLoggedIn);
console.log('Usuario actual:', window.userMenuManager?.currentUser);
console.log('Historial:', window.userMenuManager?.visitHistory);
```

---

**Autor**: GitHub Copilot  
**Fecha**: Octubre 2025  
**Versión**: 1.0  
**Proyecto**: Recirculate - Sistema de Moda Circular