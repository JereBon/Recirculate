// load-products.js - Carga dinámica de productos desde la API
// Este archivo se encarga de cargar productos desde el backend y renderizarlos en las páginas de categorías

document.addEventListener('DOMContentLoaded', async () => {
    const API_URL = 'https://recirculate-api.onrender.com/api/productos';
    const productGrid = document.querySelector('.product-grid.category-grid');
    
    if (!productGrid) {
        console.log('No se encontró product-grid en esta página');
        return; // Solo ejecutar en páginas con grid de productos
    }

    // Detectar categoría y género desde la URL actual
    const currentPath = window.location.pathname;
    let categoria = null;
    let genero = null;

    // Detectar GÉNERO
    if (currentPath.includes('/hombre/')) {
        genero = 'hombre';
    } else if (currentPath.includes('/mujer/')) {
        genero = 'mujer';
    } else if (currentPath.includes('/unisex/')) {
        genero = 'unisex';
    }

    // Detectar CATEGORÍA específica
    if (currentPath.includes('/remeras/')) {
        categoria = 'remeras';
    } else if (currentPath.includes('/Mremeras/')) {
        categoria = 'remeras';
        genero = 'mujer';
    } else if (currentPath.includes('/buzos/')) {
        categoria = 'buzos';
    } else if (currentPath.includes('/pantalones/')) {
        categoria = 'pantalones';
    } else if (currentPath.includes('/camperas/')) {
        categoria = 'camperas';
    } else if (currentPath.includes('/camisas/')) {
        categoria = 'camisas';
    } else if (currentPath.includes('/Mvestidos/')) {
        categoria = 'vestidos';
        genero = 'mujer';
    } else if (currentPath.includes('/Mpolleras/')) {
        categoria = 'polleras';
        genero = 'mujer';
    } else if (currentPath.includes('/ingresos/')) {
        // Página de nuevos ingresos - mostrar productos recientes
        categoria = null;
        genero = null;
    } else if (currentPath.includes('/descuentos/')) {
        // Página de descuentos - mostrar productos con descuento
        categoria = null;
        genero = null;
    }

    console.log('Cargando productos para:', { categoria, genero });

    try {
        // Mostrar indicador de carga
        productGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">Cargando productos...</div>';

        // Hacer petición a la API
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar productos');
        
        let productos = await response.json();
        console.log('Productos cargados:', productos.length);

        // FILTRAR productos según categoría y género
        let productosFiltrados = productos;

        // Páginas especiales
        if (currentPath.includes('/ingresos/')) {
            // Mostrar los últimos 20 productos agregados
            productosFiltrados = productos
                .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
                .slice(0, 20);
        } else if (currentPath.includes('/descuentos/')) {
            // Mostrar solo productos con descuento > 0
            productosFiltrados = productos.filter(p => p.descuento && p.descuento > 0);
        } else {
            // Filtrar por género
            if (genero) {
                productosFiltrados = productosFiltrados.filter(p => 
                    p.genero && p.genero.toLowerCase() === genero.toLowerCase()
                );
            }

            // Filtrar por categoría
            if (categoria) {
                productosFiltrados = productosFiltrados.filter(p => {
                    if (!p.categoria) return false;
                    const catProducto = p.categoria.toLowerCase();
                    const catBuscada = categoria.toLowerCase();
                    
                    // Mapeo de categorías alternativas
                    if (catBuscada === 'remeras' && (catProducto === 'tops' || catProducto === 'remeras')) return true;
                    if (catBuscada === 'vestidos' && (catProducto === 'vestidos' || catProducto === 'monos')) return true;
                    if (catBuscada === 'polleras' && (catProducto === 'polleras' || catProducto === 'shorts' || catProducto === 'skorts')) return true;
                    
                    return catProducto === catBuscada;
                });
            }
        }

        console.log('Productos filtrados:', productosFiltrados.length);

        // Renderizar productos
        if (productosFiltrados.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fas fa-box-open" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p style="font-size: 1.2rem; color: #666;">No hay productos disponibles en esta categoría</p>
                    <p style="color: #999;">Los productos agregados aparecerán aquí automáticamente</p>
                </div>
            `;
            return;
        }

        // Limpiar grid y agregar productos
        productGrid.innerHTML = '';
        
        productosFiltrados.forEach(producto => {
            const card = createProductCard(producto);
            productGrid.appendChild(card);
        });

        // Reasignar data attributes para filtros y ordenamiento
        if (typeof assignProductData === 'function') {
            assignProductData();
        }

        console.log('✅ Productos renderizados exitosamente');

    } catch (error) {
        console.error('Error al cargar productos:', error);
        productGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.2rem;">Error al cargar productos</p>
                <p>Por favor, intenta recargar la página</p>
            </div>
        `;
    }
});

// Función para crear tarjeta de producto
function createProductCard(producto) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Agregar data attributes para filtros
    card.dataset.precio = producto.precio || 0;
    card.dataset.descuento = producto.descuento || 0;
    card.dataset.color = (producto.color || '').toLowerCase();
    card.dataset.talle = (producto.talle || '').toUpperCase();
    
    // Determinar si es nuevo (últimos 30 días)
    const esNuevo = producto.fecha_creacion && 
        (new Date() - new Date(producto.fecha_creacion)) / (1000 * 60 * 60 * 24) <= 30;
    card.dataset.isNew = esNuevo ? 'true' : 'false';

    // Generar slug para URL del producto
    const slug = (producto.nombre || 'producto')
        .replace(/B&N/gi, 'BN')
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Determinar ruta del producto según género y categoría
    let productPath = '';
    const genero = (producto.genero || '').toLowerCase();
    const categoria = (producto.categoria || '').toLowerCase();

    if (genero === 'hombre') {
        if (categoria === 'remeras') productPath = `../../productos/hombre/remeras/${slug}.html`;
        else if (categoria === 'buzos') productPath = `../../productos/hombre/buzos/${slug}.html`;
        else if (categoria === 'pantalones') productPath = `../../productos/hombre/pantalones/${slug}.html`;
        else if (categoria === 'camperas') productPath = `../../productos/hombre/camperas/${slug}.html`;
        else if (categoria === 'camisas') productPath = `../../productos/hombre/camisas/${slug}.html`;
        else productPath = `../../productos/hombre/remeras/${slug}.html`;
    } else if (genero === 'mujer') {
        if (categoria === 'remeras' || categoria === 'tops') productPath = `../../productos/mujer/remeras-tops/${slug}.html`;
        else if (categoria === 'vestidos' || categoria === 'monos') productPath = `../../productos/mujer/vestidos-monos/${slug}.html`;
        else if (categoria === 'polleras' || categoria === 'shorts' || categoria === 'skorts') productPath = `../../productos/mujer/polleras-shorts/${slug}.html`;
        else productPath = `../../productos/mujer/remeras-tops/${slug}.html`;
    } else {
        productPath = `../../productos/unisex/${slug}.html`;
    }

    // Usar imagen_frente_url o imagen_url como imagen principal
    const imagenPrincipal = producto.imagen_frente_url || producto.imagen_url || '../../assets/images/placeholder.png';
    const imagenHover = producto.imagen_espalda_url || producto.imagen_hover || imagenPrincipal;

    // Construir HTML de la tarjeta
    card.innerHTML = `
        <div class="product-images">
            <img src="${imagenPrincipal}" alt="${producto.nombre}" class="main-image" loading="lazy">
            <img src="${imagenHover}" alt="${producto.nombre} - Vista trasera" class="hover-image" loading="lazy">
            ${esNuevo ? '<span class="new-tag">NEW</span>' : ''}
            ${producto.descuento && producto.descuento > 0 ? `<span class="discount-tag">${Math.round(producto.descuento)}% OFF</span>` : ''}
        </div>
        <div class="product-info">
            <h3>${producto.nombre}</h3>
            <p class="descripcion">${producto.descripcion || ''}</p>
            <p class="precio">$${producto.precio ? producto.precio.toLocaleString('es-AR') : '0'} ARS</p>
            <button class="add-to-cart-btn" onclick="event.stopPropagation();">
                <i class="fas fa-shopping-cart"></i> Agregar al Carrito
            </button>
        </div>
    `;

    // Event listener para agregar al carrito
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const productoCarrito = {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: imagenPrincipal,
            categoria: producto.categoria
        };
        
        if (typeof agregarAlCarrito === 'function') {
            agregarAlCarrito(productoCarrito);
        } else {
            console.warn('Función agregarAlCarrito no disponible');
        }
    });

    // Hacer clickeable toda la tarjeta
    card.addEventListener('click', () => {
        window.location.href = productPath;
    });

    card.style.cursor = 'pointer';

    return card;
}
