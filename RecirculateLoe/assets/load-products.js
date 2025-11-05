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
        categoria = 'remeras/tops';
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
        categoria = 'vestidos/monos';
        genero = 'mujer';
    } else if (currentPath.includes('/Mpolleras/')) {
        categoria = 'polleras/shorts/skorts';
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
            // Mostrar los últimos 20 productos agregados (ordenar por ID descendente)
            productosFiltrados = productos
                .sort((a, b) => {
                    // Intentar ordenar por fecha_creacion si existe
                    if (a.fecha_creacion && b.fecha_creacion) {
                        return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
                    }
                    // Si no hay fecha_creacion, ordenar por ID (los IDs más altos son más recientes)
                    return (b.id || 0) - (a.id || 0);
                })
                .slice(0, 20);
            console.log('📦 Mostrando últimos 20 ingresos:', productosFiltrados.map(p => p.nombre));
        } else if (currentPath.includes('/descuentos/')) {
            // Mostrar solo productos con descuento > 0
            console.log('🔍 FILTRANDO DESCUENTOS...');
            console.log('📦 Total productos antes del filtro:', productos.length);
            
            // Depuración: Ver todos los descuentos
            productos.forEach(p => {
                console.log(`Producto: "${p.nombre}" | Descuento RAW: "${p.descuento}" | Tipo: ${typeof p.descuento}`);
            });
            
            productosFiltrados = productos.filter(p => {
                const descuento = parseFloat(p.descuento);
                const tieneDescuento = !isNaN(descuento) && descuento > 0;
                console.log(`  → "${p.nombre}": descuento=${descuento}, tieneDescuento=${tieneDescuento}`);
                return tieneDescuento;
            });
            
            console.log('💰 Productos con descuento:', productosFiltrados.length);
            if (productosFiltrados.length > 0) {
                console.log('📋 Lista de productos con descuento:', productosFiltrados.map(p => `${p.nombre} (${p.descuento}%)`));
            } else {
                console.warn('⚠️ NO SE ENCONTRARON PRODUCTOS CON DESCUENTO');
            }
        } else {
            // Filtrar por género
            if (genero) {
                console.log('🔍 ANTES del filtro por género:', productosFiltrados.length, 'productos');
                productosFiltrados = productosFiltrados.filter(p => {
                    if (!p.genero) {
                        console.warn('❌ Producto sin género:', p.nombre);
                        return false;
                    }
                    
                    const generoProducto = p.genero.toLowerCase().trim();
                    const generoPagina = genero.toLowerCase().trim();
                    
                    console.log(`Producto: "${p.nombre}" | Género: "${generoProducto}" | Página: "${generoPagina}"`);
                    
                    // Si la página es "unisex", mostrar SOLO productos unisex
                    if (generoPagina === 'unisex') {
                        return generoProducto === 'unisex';
                    }
                    
                    // Si la página es "hombre" o "mujer", mostrar productos de ese género + unisex
                    const pasa = generoProducto === generoPagina || generoProducto === 'unisex';
                    console.log(`   → ${pasa ? '✅ PASA' : '❌ NO PASA'} el filtro`);
                    return pasa;
                });
                console.log('🔍 DESPUÉS del filtro por género:', productosFiltrados.length, 'productos');
            }

            // Filtrar por categoría
            if (categoria) {
                productosFiltrados = productosFiltrados.filter(p => {
                    if (!p.categoria) return false;
                    const catProducto = p.categoria.toLowerCase().trim();
                    const catBuscada = categoria.toLowerCase().trim();
                    
                    // Comparación exacta - ya no hay categorías alternativas porque usamos nombres únicos
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
        if (categoria === 'remeras/tops') productPath = `../../productos/mujer/remeras-tops/${slug}.html`;
        else if (categoria === 'vestidos/monos') productPath = `../../productos/mujer/vestidos-monos/${slug}.html`;
        else if (categoria === 'polleras/shorts/skorts') productPath = `../../productos/mujer/polleras-shorts/${slug}.html`;
        else productPath = `../../productos/mujer/remeras-tops/${slug}.html`;
    } else {
        productPath = `../../productos/unisex/${slug}.html`;
    }

    // Usar imagen_frente_url o imagen_url como imagen principal
    const imagenPrincipal = producto.imagen_frente_url || producto.imagen_url || '../../assets/images/placeholder.png';
    const imagenHover = producto.imagen_espalda_url || producto.imagen_hover || imagenPrincipal;

    console.log('Creando tarjeta para:', producto.nombre);
    console.log('Género del producto:', producto.genero, '| Categoría:', producto.categoria);
    console.log('Producto completo:', producto);

    // Construir HTML de la tarjeta - Escapar caracteres especiales
    const escaparHTML = (texto) => {
        if (!texto) return '';
        return texto
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };
    
    const nombreEscapado = escaparHTML(producto.nombre || 'Sin nombre');
    const descripcionEscapada = escaparHTML(producto.descripcion || '');
    
    // Calcular precio con descuento SOLO si tiene descuento > 0
    const descuentoNumerico = parseFloat(producto.descuento);
    const tieneDescuento = !isNaN(descuentoNumerico) && descuentoNumerico > 0;
    const precioOriginal = producto.precio || 0;
    
    // Calcular precio con descuento solo si aplica
    let precioConDescuento = precioOriginal;
    if (tieneDescuento) {
        precioConDescuento = Math.round(precioOriginal * (1 - descuentoNumerico / 100));
    }
    
    try {
        card.innerHTML = `
            <div class="product-images">
                <img src="${imagenPrincipal}" alt="${nombreEscapado}" class="main-image" loading="lazy">
                <img src="${imagenHover}" alt="${nombreEscapado} - Vista trasera" class="hover-image" loading="lazy">
                ${esNuevo ? '<span class="new-tag">NEW</span>' : ''}
                ${tieneDescuento ? `<span class="discount-tag">${Math.round(descuentoNumerico)}% OFF</span>` : ''}
            </div>
            <div class="product-info">
                <h3>${nombreEscapado}</h3>
                <p class="descripcion">${descripcionEscapada}</p>
                <p class="precio">
                    ${tieneDescuento ? `
                        <span style="text-decoration: line-through; color: #999; font-size: 0.9rem; margin-right: 8px;">
                            $${precioOriginal.toLocaleString('es-AR')}
                        </span>
                        <span style="color: #27ae60; font-weight: bold;">
                            $${precioConDescuento.toLocaleString('es-AR')} ARS
                        </span>
                    ` : `<span style="color: #666;">$${precioOriginal.toLocaleString('es-AR')} ARS</span>`}
                </p>
                <button class="add-to-cart-btn" onclick="event.stopPropagation();">
                    <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                </button>
            </div>
        `;
    } catch (error) {
        console.error('Error al crear innerHTML para producto:', producto.nombre, error);
        card.innerHTML = `<div style="padding: 1rem; color: red;">Error al cargar producto</div>`;
    }

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

    // Agregar clase de animación después de un breve delay
    setTimeout(() => {
        card.classList.add('animate-visible');
    }, 50);

    return card;
}
