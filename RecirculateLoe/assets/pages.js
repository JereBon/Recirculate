// pages.js - Lógica para páginas de categoría (Remeras, Buzos, etc.)

// ============================================
// FUNCIONES GLOBALES (Definidas fuera de DOMContentLoaded)
// ============================================

// --- Funciones del Carrito (Asumiendo que no están en utils.js o no se importan) ---
function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem('recirculate_carrito') || '[]');
    // Intenta encontrar por ID primero, si no, por nombre (fallback)
    const productoExistente = carrito.find(item => item.id === producto.id || item.nombre === producto.nombre); 
    
    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    
    localStorage.setItem('recirculate_carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarNotificacion('✓ Producto agregado al carrito');
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('recirculate_carrito') || '[]');
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    const contador = document.getElementById('cart-counter');
    if (contador) {
        contador.textContent = totalItems;
    }
}

function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.innerHTML = `<i class="fas fa-check-circle"></i><span>${mensaje}</span>`;
    
    notificacion.style.cssText = `
        position: fixed; top: 100px; right: 20px; background: #27ae60; color: white;
        padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000; display: flex; align-items: center; gap: 0.5rem; font-family: "Poppins", sans-serif;
        opacity: 1; transform: translateX(0); transition: all 0.3s ease-out;`;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateX(400px)';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// --- Función de Animación de Scroll ---
function setupScrollAnimation() {
    // CORRECCIÓN: Selecciona los elementos correctos para animar en páginas de categoría
    const elementsToAnimate = document.querySelectorAll('.product-card, .benefit-item'); // Quita .carrusel-item si no existe aquí

    if (elementsToAnimate.length === 0) return; // Salir si no hay elementos

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// --- Función de Filtrado de Productos ---
function filterProducts(minPrice, maxPrice, selectedColors, selectedSizes) {
    const productCards = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    productCards.forEach(card => {
        // Obtener el precio del producto
        const precioTexto = card.querySelector('.precio')?.textContent || '$0 ARS';
        const precio = parseFloat(precioTexto.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
        
        // Obtener el color del producto (puedes agregarlo como data-attribute en el HTML)
        const color = card.dataset.color || '';
        
        // Obtener el talle del producto (puedes agregarlo como data-attribute en el HTML)
        const talle = card.dataset.talle || '';
        
        // Verificar si cumple con los filtros
        let cumpleFiltros = true;
        
        // Filtro de precio
        if (precio < minPrice || precio > maxPrice) {
            cumpleFiltros = false;
        }
        
        // Filtro de color (solo si se seleccionaron colores)
        if (selectedColors.length > 0 && !selectedColors.includes(color.toLowerCase())) {
            cumpleFiltros = false;
        }
        
        // Filtro de talle (solo si se seleccionaron talles)
        if (selectedSizes.length > 0 && !selectedSizes.includes(talle.toUpperCase())) {
            cumpleFiltros = false;
        }
        
        // Mostrar u ocultar el producto
        if (cumpleFiltros) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Mostrar mensaje si no hay productos
    const productGrid = document.querySelector('.product-grid');
    let noResultsMsg = document.querySelector('.no-results-message');
    
    if (visibleCount === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.style.cssText = `
                grid-column: 1 / -1;
                text-align: center;
                padding: 3rem;
                font-size: 1.2rem;
                color: #666;
            `;
            noResultsMsg.textContent = 'No se encontraron productos con los filtros seleccionados.';
            productGrid.appendChild(noResultsMsg);
        }
    } else {
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }
    
    // Notificar al usuario
    mostrarNotificacion(`✓ Filtros aplicados: ${visibleCount} producto(s) encontrado(s)`);
}


// ** FUNCIÓN DE RESOLUCIÓN DE URL MEJORADA PARA ESTRUCTURA /RecirculateLoe **
function resolveMappedUrl(mappedPath) {
    try {
        if (mappedPath.startsWith('/') || mappedPath.startsWith('http')) return mappedPath;
        
        const segments = window.location.pathname.split('/');
        // La carpeta raíz que contiene todas las páginas y home
        const rootFolderName = 'RecirculateLoe'; 
        const idx = segments.lastIndexOf(rootFolderName);
        
        if (idx !== -1) {
            // Construir la URL base hasta la carpeta raíz del proyecto de páginas
            const base = segments.slice(0, idx + 1).join('/'); 
            return window.location.origin + base + '/' + mappedPath.replace(/^\/+/, '');
        }
        
        // Fallback si no se encuentra la carpeta raíz
        return mappedPath; 
        
    } catch (err) {
        console.warn('resolveMappedUrl error:', err);
        return mappedPath;
    }
}


// ============================================
// LÓGICA PRINCIPAL (Dentro de DOMContentLoaded)
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    
    actualizarContadorCarrito(); // Carga inicial del contador

    // --- Lógica del Logo ---
    const logo = document.querySelector('.header-logo');
    if (logo) {
        // Evitar añadir el handler de redirect cuando ya estamos en la página home
        const isHomePage = /\/home(\/home)?\.html$/.test(window.location.pathname) || /\/home\.html$/.test(window.location.pathname);
        if (!isHomePage) {
            logo.addEventListener('click', (e) => {
                e.stopPropagation();
                // Redirigir al home usando el resolvedor
                if (typeof resolveMappedUrl === 'function') {
                    // La ruta mapeada es 'home/home.html' DENTRO de RecirculateLoe
                    window.location.href = resolveMappedUrl('home/home.html');
                } else {
                    window.location.href = '../home/home.html';
                }
            });
        }
    }
    
    // --- Lógica Común Sidebars y Overlay ---
    const body = document.body;
    const overlay = document.querySelector('.overlay');
    
    // Función genérica para cerrar cualquier sidebar activo
    function closeAnyOpenSidebar() {
        const openSidebars = document.querySelectorAll('.sidebar.open, .filter-sidebar.open');
        openSidebars.forEach(sb => sb.classList.remove('open'));
        body.classList.remove('sidebar-active');
    }

    if (overlay) {
        overlay.addEventListener('click', closeAnyOpenSidebar);
    }
    
    // Cerrar sidebars al hacer clic fuera
    window.addEventListener('click', (event) => {
        const sidebar = document.getElementById('sidebar-menu');
        const filterSidebar = document.getElementById('filter-sidebar');
        const searchSidebar = document.getElementById('sidebar-search');
        const menuBtn = document.getElementById('menu-btn');
        const filterBtn = document.querySelector('.filter-btn');
        const searchBtnHeader = document.getElementById('search-btn');
        const searchInputHeader = document.getElementById('search-input');

        let clickedInsideSidebar = (sidebar && sidebar.contains(event.target)) ||
                                   (filterSidebar && filterSidebar.contains(event.target)) ||
                                   (searchSidebar && searchSidebar.contains(event.target)) ||
                                   event.target === menuBtn || (menuBtn && menuBtn.contains(event.target)) ||
                                   event.target === filterBtn || (filterBtn && filterBtn.contains(event.target)) ||
                                   event.target === searchBtnHeader || (searchBtnHeader && searchBtnHeader.contains(event.target)) ||
                                   event.target === searchInputHeader || (searchInputHeader && searchInputHeader.contains(event.target));

        if (!clickedInsideSidebar && body.classList.contains('sidebar-active')) {
             closeAnyOpenSidebar();
        }
    });


    // --- Lógica Específica: Sidebar de Categorías (Izquierdo) ---
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const sidebar = document.getElementById('sidebar-menu');
    const categoryHeaders = document.querySelectorAll('.sidebar-category-header');

    console.log('Pages.js cargado - Category headers encontrados:', categoryHeaders.length);

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            closeAnyOpenSidebar(); // Cierra otros sidebars primero
            sidebar.classList.add('open');
            body.classList.add('sidebar-active');
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeAnyOpenSidebar);

    // Verificar que los category headers existan antes de agregar listeners
    if (categoryHeaders && categoryHeaders.length > 0) {
        console.log('Agregando event listeners a', categoryHeaders.length, 'category headers');
        categoryHeaders.forEach((header, index) => {
            header.addEventListener('click', (event) => {
                console.log('Click en category header', index);
                // Asegurar que el click no se propague
                event.stopPropagation();
                
                const parentCategory = header.closest('.sidebar-category');
                if (!parentCategory) {
                    console.warn('No se encontró parentCategory para header', index);
                    return;
                }
                
                const isActive = parentCategory.classList.contains('active');
                console.log('Categoría activa:', isActive);
                
                // Cierra todos antes de abrir/cerrar el actual
                document.querySelectorAll('.sidebar-category').forEach(cat => cat.classList.remove('active'));
                
                if (!isActive) {
                     parentCategory.classList.add('active');
                     console.log('Categoría activada');
                }
            });
        });
    } else {
        console.warn('⚠️ No se encontraron category headers en el DOM');
    }

    // Cerrar sidebar al hacer clic en cualquier enlace del sidebar
    if (sidebar) {
        const sidebarLinks = sidebar.querySelectorAll('a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeAnyOpenSidebar();
            });
        });
    }

    // --- Lógica Específica: Sidebar de Filtros (Derecho) ---
    const filterBtn = document.querySelector('.filter-btn');
    const filterSidebar = document.getElementById('filter-sidebar');
    const closeFilterBtn = document.getElementById('close-filter-btn');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    
    if (filterBtn && filterSidebar) {
        filterBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            closeAnyOpenSidebar(); // Cierra otros sidebars primero
            filterSidebar.classList.add('open');
            body.classList.add('sidebar-active');
        });
    }
    if (closeFilterBtn) {
        closeFilterBtn.addEventListener('click', closeAnyOpenSidebar);
    }

    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.addEventListener('click', () => {
            option.classList.toggle('selected');
        });
    });

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
            const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;
            const selectedColors = Array.from(document.querySelectorAll('.color-options .filter-option.selected')).map(el => el.dataset.color);
            const selectedSizes = Array.from(document.querySelectorAll('.size-options .filter-option.selected')).map(el => el.dataset.size);

            console.log('Filtros a aplicar:', { minPrice, maxPrice, colors: selectedColors, sizes: selectedSizes });
            
            // Aplicar filtros a los productos
            filterProducts(minPrice, maxPrice, selectedColors, selectedSizes);
            
            closeAnyOpenSidebar(); 
        });
    }

    // Botón para limpiar filtros
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            // Limpiar selecciones de color y talle
            document.querySelectorAll('.filter-option.selected').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Restaurar valores de precio
            const minPriceInput = document.getElementById('min-price');
            const maxPriceInput = document.getElementById('max-price');
            if (minPriceInput) minPriceInput.value = '30000';
            if (maxPriceInput) maxPriceInput.value = '50000';
            
            // Mostrar todos los productos
            document.querySelectorAll('.product-card').forEach(card => {
                card.style.display = 'block';
            });
            
            // Eliminar mensaje de "sin resultados" si existe
            const noResultsMsg = document.querySelector('.no-results-message');
            if (noResultsMsg) {
                noResultsMsg.remove();
            }
            
            mostrarNotificacion('✓ Filtros limpiados');
            closeAnyOpenSidebar();
        });
    }

    // --- Lógica para el Buscador (usar sidebar en todas las páginas) ---
    const searchContainer = document.getElementById('search-container');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    // Si el sidebar de búsqueda no está presente en el DOM, lo inyectamos para que esté disponible en todas las páginas
        if (!document.getElementById('sidebar-search')) {
                const sidebarHtml = `
                <div id="sidebar-search" class="sidebar search-sidebar">
                    <button id="search-close-btn" class="close-btn">&times;</button>
                    <div class="search-top">
                        <div class="search-top-left">
                            <button id="search-btn-icon" class="header-icon search-icon" aria-label="Buscar"><i class="fas fa-search"></i></button>
                            <input id="search-sidebar-input" type="text" class="search-top-input" placeholder="¿Qué busca?">
                        </div>
                    </div>
                    <hr class="search-divider">
                    <div class="sidebar-search-content">
                        <div id="search-results" class="search-results"></div>
                        <div id="search-suggestions" class="search-suggestions"></div>
                    </div>
                </div>
                `;
                document.body.insertAdjacentHTML('beforeend', sidebarHtml);
        }

    // Referencias a elementos del sidebar (ya existentes o recién inyectados)
    const sidebarSearch = document.getElementById('sidebar-search');
    const searchCloseBtn = document.getElementById('search-close-btn');
    const searchSidebarInput = document.getElementById('search-sidebar-input');
    const searchSidebarGo = document.getElementById('search-sidebar-go');
    const searchResultsContainer = document.getElementById('search-results');
    const searchSuggestionsContainer = document.getElementById('search-suggestions');

    // Catálogo hardcodeado y mapa de búsqueda (compartido con home)
    const catalog = [
      { name: 'Campera Ecocuero', url: '../productos/hombre/camperas/campera-ecocuero.html', img: '../assets/images/pages/camperas/Campera Ecocuero 1.png', price: '$70.000' },
      { name: 'Top Pegaso Bordo', url: '../productos/mujer/remeras-tops/top-pegaso-bordo.html', img: '../assets/images/pages/Mremeras/4 Top Pegaso Bordo a.png', price: '$105.000' },
      { name: 'Pollera Samer', url: '../productos/mujer/polleras-shorts/pollera-samer.html', img: '../assets/images/pages/Mpolleras/1 Pollera Samer a.png', price: '$65.000' },
      { name: 'Vestido Italo', url: '../productos/mujer/vestidos-monos/vestido-italo.html', img: '../assets/images/pages/Mvestidos/6 Vestido Italo a.png', price: '$138.000' }
    ];

    // Mapeo lógico a rutas dentro de la carpeta del sitio. Usamos rutas relativas
    // a la raíz del proyecto (a partir de la carpeta RecirculateLoe) y las
    // resolvemos dinámicamente en tiempo de ejecución para que funcionen desde
    // cualquier subdirectorio (home, páginas de categoría, productos, etc.).
    const searchMap = {
      'remera': 'pages/remeras/remeras.html', 'remeras': 'pages/remeras/remeras.html',
      'pantalon': 'pages/pantalones/pantalones.html', 'pantalones': 'pages/pantalones/pantalones.html',
      'buzo': 'pages/buzos/buzos.html', 'buzos': 'pages/buzos/buzos.html',
      'camisa': 'pages/camisas/camisas.html', 'camisas': 'pages/camisas/camisas.html',
      'campera': 'pages/camperas/camperas.html', 'camperas': 'pages/camperas/camperas.html',
      'jacket': 'pages/camperas/camperas.html', 'hoodie': 'pages/buzos/buzos.html',
      'sudadera': 'pages/buzos/buzos.html', 'polo': 'pages/camisas/camisas.html',
      'shirt': 'pages/remeras/remeras.html', 'jean': 'pages/pantalones/pantalones.html',
      'jeans': 'pages/pantalones/pantalones.html', 'jogger': 'pages/pantalones/pantalones.html',
      'home': 'home/home.html', 'inicio': 'home/home.html'
    };
    
    // Funciones para mostrar/ocultar y realizar búsquedas en el sidebar
    function openSearchSidebar() {
        // Cerrar otros sidebars primero
        closeAnyOpenSidebar();
        if (sidebarSearch) {
            sidebarSearch.classList.add('open');
            body.classList.add('sidebar-active');
            if (searchResultsContainer) { searchResultsContainer.innerHTML = ''; searchResultsContainer.classList.remove('visible'); }
            if (searchSuggestionsContainer) { searchSuggestionsContainer.innerHTML = ''; searchSuggestionsContainer.classList.remove('visible'); }
            if (searchSidebarInput) { searchSidebarInput.value = ''; setTimeout(() => searchSidebarInput.focus(), 50); }
        }
    }

    function closeSearchSidebar() {
        if (sidebarSearch) {
            sidebarSearch.classList.remove('open');
            body.classList.remove('sidebar-active');
        }
    }

    function renderSearchResults(results) {
        if (!searchResultsContainer) return;
        if (results.length === 0) {
            searchResultsContainer.innerHTML = `<p class="no-results">No se encontraron productos.</p>`;
            searchResultsContainer.classList.add('visible');
            if (searchSuggestionsContainer) searchSuggestionsContainer.classList.remove('visible');
            return;
        }
        searchResultsContainer.innerHTML = '';
        results.forEach(item => {
            const card = document.createElement('div');
            card.className = 'search-result-card';
            card.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="search-thumb">
                <div class="search-info">
                  <strong class="search-name">${item.name}</strong>
                  <span class="search-price">${item.price}</span>
                </div>
            `;
            card.addEventListener('click', () => { window.location.href = resolveMappedUrl(item.url); });
            searchResultsContainer.appendChild(card);
        });
        searchResultsContainer.classList.add('visible');
        if (searchSuggestionsContainer) searchSuggestionsContainer.classList.remove('visible');
    }

    function performSidebarSearch(query) {
        const searchTerm = query.toLowerCase();
        const results = catalog.filter(item => item.name.toLowerCase().includes(searchTerm));
        if (results.length > 0) {
            renderSearchResults(results);
            openSearchSidebar();
            return;
        }
        // fallback a mapa de categorías
        for (const [key, url] of Object.entries(searchMap)) {
            if (key.includes(searchTerm) || searchTerm.includes(key)) {
                window.location.href = resolveMappedUrl(url);
                return;
            }
        }
        // si no hay nada
        if (searchResultsContainer) {
            searchResultsContainer.innerHTML = `<p class="no-results">No se encontraron resultados para "${query}".</p>`;
            searchResultsContainer.classList.add('visible');
            openSearchSidebar();
        } else {
            alert(`No se encontraron resultados para "${query}".`);
        }
    }

    // Exponer las funciones principales al scope global para que otras páginas
    window.openSearchSidebar = openSearchSidebar;
    window.closeSearchSidebar = closeSearchSidebar;
    window.performSidebarSearch = performSidebarSearch;

    // ** FUNCIÓN GLOBAL CLAVE PARA IR AL CARRITO **
    window.goToCart = function() {
        try {
            // Usa la ruta mapeada 'carrito/carrito.html' DENTRO de RecirculateLoe
            window.location.href = resolveMappedUrl('carrito/carrito.html');
        } catch (err) {
            // Fallback simple
            window.location.href = '/carrito/carrito.html';
        }
    };

    // ** Corregir y asegurar todos los enlaces estáticos que apuntan al carrito **
    document.querySelectorAll('a[href]').forEach(a => {
        try {
            const href = a.getAttribute('href');
            if (!href) return;
            // Si el enlace apunta a 'carrito/carrito.html' o similar, lo resolvemos
            if (href.includes('carrito')) {
                // Reemplazamos el HREF del elemento por la ruta resuelta
                a.href = resolveMappedUrl('carrito/carrito.html');
            }
        } catch (err) { /* ignore malformed hrefs */ }
    });

    // Interceptar botones/links con texto "Comprar Ahora" 
    document.querySelectorAll('button, a').forEach(el => {
        try {
            const txt = (el.textContent || '').trim().toLowerCase();
            if (txt.includes('comprar ahora') || txt === 'comprar ahora') {
                el.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    if (typeof window.goToCart === 'function') window.goToCart();
                });
            }
        } catch (err) { /* ignore */ }
    });

    // Event listeners: reemplazar el comportamiento inline por abrir el sidebar
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => { e.stopPropagation(); openSearchSidebar(); });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim() !== '') {
                performSidebarSearch(searchInput.value.trim());
            }
        });
    }

    // listeners para elementos del sidebar
    if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearchSidebar);
    // No hay botón "Buscar" en el sidebar: la búsqueda se ejecuta al presionar Enter en los inputs
    if (searchSidebarInput) {
        searchSidebarInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchSidebarInput.value.trim() !== '') {
                performSidebarSearch(searchSidebarInput.value.trim());
            }
        });
    }

    // --- Lógica de Ordenamiento (Mejorada) ---
    const ordenarSelect = document.getElementById('ordenar');
    const productGrid = document.querySelector('.product-grid');

    if (ordenarSelect && productGrid) {
        
        // Guardar el orden original al cargar la página
        let originalOrder = [];
        
        function assignProductData() {
            const cards = productGrid.querySelectorAll('.product-card');
            originalOrder = Array.from(cards); // Guardar orden original
            
            cards.forEach((card, index) => {
                const precioTexto = card.querySelector('.precio')?.textContent || '$0 ARS';
                const descuentoTag = card.querySelector('.discount-tag')?.textContent || '0%';
                const newTag = card.querySelector('.new-tag');
                
                const precio = parseFloat(precioTexto.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
                card.dataset.precio = precio;
                
                const descuento = parseFloat(descuentoTag.replace(/[^0-9.]/g, '')) || 0;
                card.dataset.descuento = descuento;
                
                // Marcar si tiene NEW tag
                card.dataset.isNew = newTag ? 'true' : 'false';
                
                // Guardar orden original
                card.dataset.originalOrder = index;
            });
        }
        assignProductData(); // Ejecutar al cargar

        ordenarSelect.addEventListener('change', (e) => {
            sortProducts(e.target.value);
        });

        function sortProducts(criteria) {
            const products = Array.from(productGrid.querySelectorAll('.product-card'));
            
            if (criteria === 'default') {
                // Restaurar orden original
                products.sort((a, b) => {
                    return parseInt(a.dataset.originalOrder) - parseInt(b.dataset.originalOrder);
                });
            } else if (criteria === 'precio-asc' || criteria === 'precio-desc') {
                // Ordenar por precio
                const isAsc = criteria === 'precio-asc';
                
                products.sort((a, b) => {
                    const priceA = parseFloat(a.dataset.precio);
                    const priceB = parseFloat(b.dataset.precio);
                    return isAsc ? priceA - priceB : priceB - priceA;
                });
            } else if (criteria === 'descuento-asc' || criteria === 'descuento-desc') {
                // Separar productos con descuento y sin descuento
                const conDescuento = products.filter(p => parseFloat(p.dataset.descuento) > 0);
                const sinDescuento = products.filter(p => parseFloat(p.dataset.descuento) === 0);
                
                const isAsc = criteria === 'descuento-asc';
                
                // Ordenar productos con descuento por porcentaje de descuento
                conDescuento.sort((a, b) => {
                    const discountA = parseFloat(a.dataset.descuento);
                    const discountB = parseFloat(b.dataset.descuento);
                    return isAsc ? discountA - discountB : discountB - discountA;
                });
                
                // Ordenar productos sin descuento por precio (menor a mayor)
                sinDescuento.sort((a, b) => {
                    const priceA = parseFloat(a.dataset.precio);
                    const priceB = parseFloat(b.dataset.precio);
                    return priceA - priceB;
                });
                
                // Combinar: productos con descuento primero, luego sin descuento
                products.length = 0;
                products.push(...conDescuento, ...sinDescuento);
            } else if (criteria === 'nuevos') {
                // Separar productos nuevos y normales
                const nuevos = products.filter(p => p.dataset.isNew === 'true');
                const normales = products.filter(p => p.dataset.isNew === 'false');
                
                // Ordenar nuevos por precio (menor a mayor)
                nuevos.sort((a, b) => {
                    const priceA = parseFloat(a.dataset.precio);
                    const priceB = parseFloat(b.dataset.precio);
                    return priceA - priceB;
                });
                
                // Ordenar normales por precio (menor a mayor)
                normales.sort((a, b) => {
                    const priceA = parseFloat(a.dataset.precio);
                    const priceB = parseFloat(b.dataset.precio);
                    return priceA - priceB;
                });
                
                // Combinar: productos nuevos primero, luego normales
                products.length = 0;
                products.push(...nuevos, ...normales);
            }

            // Aplicar el nuevo orden al DOM
            products.forEach(card => productGrid.appendChild(card));
        }
    }
    
    // --- Lógica para el Contador del Carrito ---
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productCard = button.closest('.product-card');
            const nombre = productCard.querySelector('h3').textContent;
            const precioTexto = productCard.querySelector('.precio').textContent;
            const precio = parseFloat(precioTexto.replace(/[^\d]/g, '')); // Simplificado
            const imagen = productCard.querySelector('.main-image').src;
            
            const producto = {
                id: `prod_${Date.now()}_${index}`, 
                nombre,
                precio,
                imagen,
                categoria: 'Ropa usada' // Mejorar esto si es posible
            };
            agregarAlCarrito(producto);
        });
    });

    // --- Lógica para la animación al hacer scroll ---
    setupScrollAnimation(); 

    // --- Hacer las tarjetas de producto clickeables ---
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        // Hacer clickeable toda la tarjeta excepto el botón de agregar al carrito
        card.addEventListener('click', (e) => {
            // Si el click fue en el botón de agregar al carrito, no hacer nada
            if (e.target.closest('.add-to-cart-btn')) {
                return;
            }
            
            // Obtener el nombre del producto y generar el slug para la URL
            const productName = card.querySelector('h3').textContent.trim();
            
            // Reemplazar "B&N" por "BN" antes de generar el slug
            const normalizedName = productName.replace(/B&N/gi, 'BN');
            
            const productSlug = normalizedName
                .toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
                .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales con guiones
                .replace(/^-+|-+$/g, ''); // Quitar guiones al inicio y final
            
            // Detectar la categoría basándose en la URL actual
            const currentPath = window.location.pathname;
            let productPath = '';
            
            // Determinar la ruta según la categoría (Usando rutas relativas que funcionan)
            if (currentPath.includes('/pantalones/')) {
                productPath = `../../productos/hombre/pantalones/${productSlug}.html`;
            } else if (currentPath.includes('/remeras/')) {
                productPath = `../../productos/hombre/remeras/${productSlug}.html`;
            } else if (currentPath.includes('/buzos/')) {
                productPath = `../../productos/hombre/buzos/${productSlug}.html`;
            } else if (currentPath.includes('/camperas/')) {
                productPath = `../../productos/hombre/camperas/${productSlug}.html`;
            } else if (currentPath.includes('/camisas/')) {
                productPath = `../../productos/hombre/camisas/${productSlug}.html`;
            } else if (currentPath.includes('/Mvestidos/')) {
                productPath = `../../productos/mujer/vestidos-monos/${productSlug}.html`;
            } else if (currentPath.includes('/Mremeras/')) {
                productPath = `../../productos/mujer/remeras-tops/${productSlug}.html`;
            } else if (currentPath.includes('/Mpolleras/')) {
                productPath = `../../productos/mujer/polleras-shorts/${productSlug}.html`;
            } else if (currentPath.includes('/unisex/')) {
                productPath = `../../productos/unisex/${productSlug}.html`;
            } else if (currentPath.includes('/hombre/')) {
                // Lógica de detección simplificada para la página general de hombre
                if (productName.toLowerCase().includes('pantalon') || productName.toLowerCase().includes('jean')) {
                    productPath = `../../productos/hombre/pantalones/${productSlug}.html`;
                } else if (productName.toLowerCase().includes('remera')) {
                    productPath = `../../productos/hombre/remeras/${productSlug}.html`;
                } else if (productName.toLowerCase().includes('buzo') || productName.toLowerCase().includes('hoodie')) {
                    productPath = `../../productos/hombre/buzos/${productSlug}.html`;
                } else if (productName.toLowerCase().includes('campera') || productName.toLowerCase().includes('jacket')) {
                    productPath = `../../productos/hombre/camperas/${productSlug}.html`;
                } else if (productName.toLowerCase().includes('camisa')) {
                    productPath = `../../productos/hombre/camisas/${productSlug}.html`;
                } else {
                    productPath = `../../productos/hombre/pantalones/${productSlug}.html`; // Fallback
                }
            } else if (currentPath.includes('/mujer/')) {
                // Lógica de detección simplificada para la página general de mujer
                if (productName.toLowerCase().includes('vestido') || productName.toLowerCase().includes('mono')) {
                    productPath = `../../productos/mujer/vestidos-monos/${productSlug}.html`;
                } else if (productName.toLowerCase().includes('remera') || productName.toLowerCase().includes('top')) {
                    productPath = `../../productos/mujer/remeras-tops/${productSlug}.html`;
                } else if (productName.toLowerCase().includes('pollera') || productName.toLowerCase().includes('short') || productName.toLowerCase().includes('skort')) {
                    productPath = `../../productos/mujer/polleras-shorts/${productSlug}.html`;
                } else {
                    productPath = `../../productos/mujer/vestidos-monos/${productSlug}.html`; // Fallback
                }
            } else if (currentPath.includes('/ingresos/') || currentPath.includes('/descuentos/')) {
                // Lógica de detección simplificada para INGRESOS y DESCUENTOS
                const lowerName = productName.toLowerCase();
                
                if (lowerName.includes('vestido') || lowerName.includes('mono') || lowerName.includes('top') || lowerName.includes('pollera') || lowerName.includes('short')) {
                    // Producto de mujer (simplificado)
                    productPath = `../../productos/mujer/vestidos-monos/${productSlug}.html`; // Usamos una categoría como ejemplo
                } else {
                    // Producto de hombre (simplificado)
                    productPath = `../../productos/hombre/pantalones/${productSlug}.html`; // Usamos una categoría como ejemplo
                }
            } else {
                // Fallback: ruta antigua para compatibilidad
                productPath = `../../productos/${productSlug}.html`;
            }
            
            // Redirigir a la página del producto
            window.location.href = productPath;
        });
        
        // Agregar cursor pointer para indicar que es clickeable
        card.style.cursor = 'pointer';
        
        // Excepto en el botón que mantiene su cursor
        const addBtn = card.querySelector('.add-to-cart-btn');
        if (addBtn) {
            addBtn.style.cursor = 'pointer';
        }
    });

}); // Fin del DOMContentLoaded