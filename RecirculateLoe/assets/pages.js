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
                // Redirigir al home usando el resolvedor para mantener rutas correctas
                if (typeof resolveMappedUrl === 'function') {
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
    // rely on CSS z-index; avoid inline z-index changes to prevent stacking issues
        
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
            // avoid changing overlay z-index here
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
            // avoid changing overlay z-index here

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
                            <input id="search-sidebar-input" type="text" class="search-top-input" placeholder="Buscar productos..." autocomplete="off">
                        </div>
                    </div>
                    <hr class="search-divider">
                    <div class="sidebar-search-content">
                        <div id="search-results" class="search-results"></div>
                        <div id="search-suggestions" class="search-suggestions"></div>
                        <div id="search-hint" class="search-initial-hint">
                            <i class="fas fa-search" style="font-size: 2rem; color: #ddd; margin-bottom: 10px;"></i>
                            <p style="color: #888; margin: 0;">Escribe para buscar productos</p>
                            <p style="color: #aaa; font-size: 0.85rem; margin-top: 5px;">Ej: "buzo", "remera negra", "pantalón"</p>
                        </div>
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

    // Función para obtener dinámicamente los productos de la página actual
    function getProductsFromPage() {
        const products = [];
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const nameElement = card.querySelector('h3');
            const imgElement = card.querySelector('.main-image');
            const priceElement = card.querySelector('.precio');
            
            if (nameElement && imgElement && priceElement) {
                const name = nameElement.textContent.trim();
                const img = imgElement.src;
                const price = priceElement.textContent.trim();
                
                // Generar URL del producto usando la misma lógica de las tarjetas clickeables
                const normalizedName = name.replace(/B&N/gi, 'BN');
                const productSlug = normalizedName
                    .toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                
                const currentPath = window.location.pathname;
                let productPath = '';
                
                // Determinar la ruta según la categoría actual
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
                } else {
                    // Detectar por nombre del producto
                    const lowerName = name.toLowerCase();
                    if (lowerName.includes('vestido') || lowerName.includes('mono')) {
                        productPath = `../../productos/mujer/vestidos-monos/${productSlug}.html`;
                    } else if (lowerName.includes('top')) {
                        productPath = `../../productos/mujer/remeras-tops/${productSlug}.html`;
                    } else if (lowerName.includes('pollera') || lowerName.includes('short') || lowerName.includes('skort')) {
                        productPath = `../../productos/mujer/polleras-shorts/${productSlug}.html`;
                    } else if (lowerName.includes('pantalon') || lowerName.includes('jean')) {
                        productPath = `../../productos/hombre/pantalones/${productSlug}.html`;
                    } else if (lowerName.includes('remera')) {
                        productPath = `../../productos/hombre/remeras/${productSlug}.html`;
                    } else if (lowerName.includes('buzo') || lowerName.includes('hoodie')) {
                        productPath = `../../productos/hombre/buzos/${productSlug}.html`;
                    } else if (lowerName.includes('campera') || lowerName.includes('jacket')) {
                        productPath = `../../productos/hombre/camperas/${productSlug}.html`;
                    } else if (lowerName.includes('camisa')) {
                        productPath = `../../productos/hombre/camisas/${productSlug}.html`;
                    }
                }
                
                products.push({ name, url: productPath, img, price });
            }
        });
        
        return products;
    }

    // Mapeo lógico a rutas dentro de la carpeta del sitio (para búsqueda de categorías)
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
      'home': 'home/home.html', 'inicio': 'home/home.html',
      'mujer': 'pages/mujer/mujer.html', 'hombre': 'pages/hombre/hombre.html',
      'unisex': 'pages/unisex/unisex.html', 'vestido': 'pages/Mvestidos/Mvestidos.html',
      'vestidos': 'pages/Mvestidos/Mvestidos.html', 'pollera': 'pages/Mpolleras/Mpolleras.html',
      'polleras': 'pages/Mpolleras/Mpolleras.html', 'top': 'pages/Mremeras/Mremeras.html',
      'tops': 'pages/Mremeras/Mremeras.html', 'descuento': 'pages/descuentos/descuentos.html',
      'descuentos': 'pages/descuentos/descuentos.html', 'ingreso': 'pages/ingresos/ingresos.html',
      'ingresos': 'pages/ingresos/ingresos.html', 'nuevo': 'pages/ingresos/ingresos.html',
      'nuevos': 'pages/ingresos/ingresos.html'
    };

    // Construye una URL absoluta basada en la carpeta "RecirculateLoe" encontrada
    // en el `location.pathname`. Esto asegura que `pages/...` se resuelva al
    // mismo lugar sin importar si estamos en `home/`, `pages/...` o `productos/...`.
    function resolveMappedUrl(mappedPath) {
        try {
            // Si ya es absoluta desde la raíz, devolverla (soporta '/foo/bar')
            if (mappedPath.startsWith('/') || mappedPath.startsWith('http')) return mappedPath;
            const segments = window.location.pathname.split('/');
            const idx = segments.lastIndexOf('RecirculateLoe');
            if (idx !== -1) {
                const base = segments.slice(0, idx + 1).join('/'); // e.g. '/.../RecirculateLoe'
                return window.location.origin + base + '/' + mappedPath.replace(/^\/+/, '');
            }
            // Fallback sencillo: construir a partir del origin
            return window.location.origin + '/' + mappedPath.replace(/^\/+/, '');
        } catch (err) {
            console.warn('resolveMappedUrl error:', err);
            return mappedPath; // último recurso
        }
    }

    // Funciones para mostrar/ocultar y realizar búsquedas en el sidebar
    function openSearchSidebar(keepValue = false) {
        // Si ya está abierto y queremos mantener el valor, no hacer nada
        if (sidebarSearch && sidebarSearch.classList.contains('open') && keepValue) {
            return;
        }
        
        // Cerrar otros sidebars primero
        closeAnyOpenSidebar();
        if (sidebarSearch) {
            sidebarSearch.classList.add('open');
            body.classList.add('sidebar-active');
            if (searchResultsContainer) searchResultsContainer.innerHTML = '';
            if (searchSuggestionsContainer) searchSuggestionsContainer.classList.remove('visible');
            
            // Mostrar hint inicial solo si no hay valor
            const searchHint = document.getElementById('search-hint');
            if (searchHint && !keepValue) {
                searchHint.style.display = 'flex';
            } else if (searchHint) {
                searchHint.style.display = 'none';
            }
            
            if (searchSidebarInput && !keepValue) {
                // Solo limpiar y hacer focus si NO estamos manteniendo el valor
                searchSidebarInput.value = '';
                searchSidebarInput.focus();
            }
            // avoid changing overlay z-index here
        }
    }    function closeSearchSidebar() {
        if (sidebarSearch) {
            sidebarSearch.classList.remove('open');
            body.classList.remove('sidebar-active');
            // avoid changing overlay z-index here
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
        
        // Agregar contador de resultados
        const resultCount = results.length;
        const countText = resultCount === 1 ? '1 producto encontrado' : `${resultCount} productos encontrados`;
        
        searchResultsContainer.innerHTML = `<div class="search-results-count">${countText}</div>`;
        
        results.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'search-result-card';
            card.style.animationDelay = `${index * 0.03}s`; // Animación escalonada
            card.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="search-thumb" loading="lazy">
                <div class="search-info">
                  <strong class="search-name">${item.name}</strong>
                  <span class="search-price">${item.price}</span>
                </div>
                <i class="fas fa-chevron-right search-arrow"></i>
            `;
            card.addEventListener('click', () => { 
                closeSearchSidebar();
                window.location.href = item.url; 
            });
            searchResultsContainer.appendChild(card);
        });
        searchResultsContainer.classList.add('visible');
        if (searchSuggestionsContainer) searchSuggestionsContainer.classList.remove('visible');
    }

    function performSidebarSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        // 1. Primero buscar en los productos de la página actual
        const catalog = getProductsFromPage();
        const results = catalog.filter(item => {
            const name = item.name.toLowerCase();
            const price = item.price.toLowerCase();
            // Buscar en nombre y precio
            return name.includes(searchTerm) || 
                   price.includes(searchTerm) ||
                   // Buscar por palabras individuales
                   searchTerm.split(' ').some(word => name.includes(word));
        });
        
        if (results.length > 0) {
            renderSearchResults(results);
            openSearchSidebar();
            return;
        }
        
        // 2. Si no hay resultados en la página, buscar en categorías
        for (const [key, url] of Object.entries(searchMap)) {
            if (key.includes(searchTerm) || searchTerm.includes(key)) {
                window.location.href = resolveMappedUrl(url);
                return;
            }
        }
        
        // 3. Si no hay resultados, mostrar mensaje
        if (searchResultsContainer) {
            searchResultsContainer.innerHTML = `
                <div class="no-results">
                    <p>No se encontraron resultados para "<strong>${query}</strong>"</p>
                    <p class="search-hint">Intenta buscar por:</p>
                    <ul class="search-hints">
                        <li>Nombre del producto (ej: "buzo", "remera")</li>
                        <li>Color (ej: "negro", "blanco")</li>
                        <li>Marca (ej: "kalf", "nova")</li>
                        <li>Categoría (ej: "pantalones", "vestidos")</li>
                    </ul>
                </div>
            `;
            searchResultsContainer.classList.add('visible');
            openSearchSidebar();
        } else {
            alert(`No se encontraron resultados para "${query}".`);
        }
    }

    // Exponer las funciones principales al scope global para que otras páginas
    // (por ejemplo `home/home.js`) puedan reutilizar el mismo comportamiento
    // de búsqueda / sidebar sin duplicar código.
    window.openSearchSidebar = openSearchSidebar;
    window.closeSearchSidebar = closeSearchSidebar;
    window.performSidebarSearch = performSidebarSearch;

    // Función global para ir al carrito usando el resolvedor de rutas para
    // asegurar que la URL siempre apunte a la copia correcta del sitio.
    window.goToCart = function() {
        try {
            window.location.href = resolveMappedUrl('carrito/carrito.html');
        } catch (err) {
            // Fallback simple
            window.location.href = '/carrito/carrito.html';
        }
    };

    // Normalizar enlaces estáticos que apuntan al carrito en el DOM para evitar
    // errores 404 cuando el sitio se sirve desde una subcarpeta diferente.
    document.querySelectorAll('a[href]').forEach(a => {
        try {
            const href = a.getAttribute('href');
            if (!href) return;
            // Si el enlace apunta a cualquier ruta que contenga 'carrito', lo
            // resolvemos a la URL correcta en tiempo de ejecución.
            if (href.includes('carrito')) {
                a.href = resolveMappedUrl('carrito/carrito.html');
            }
        } catch (err) { /* ignore malformed hrefs */ }
    });

    // Interceptar botones/links con texto "Comprar Ahora" para usar la URL
    // resuelta por `goToCart()` y así evitar rutas relativas rotas.
    document.querySelectorAll('button, a').forEach(el => {
        try {
            const txt = (el.textContent || '').trim().toLowerCase();
            if (txt.includes('comprar ahora') || txt === 'comprar ahora') {
                el.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    // Si antes añadimos el producto al localStorage, ya está.
                    // Redirigimos al carrito usando la URL resuelta.
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
    
    // Búsqueda en tiempo real mientras escribes
    if (searchSidebarInput) {
        // Buscar al presionar Enter
        searchSidebarInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchSidebarInput.value.trim() !== '') {
                performSidebarSearch(searchSidebarInput.value.trim());
            }
        });
        
        // Búsqueda en tiempo real mientras escribes (autocompletado)
        searchSidebarInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length === 0) {
                // Si el campo está vacío, limpiar resultados y mostrar hint
                if (searchResultsContainer) {
                    searchResultsContainer.innerHTML = '';
                    searchResultsContainer.classList.remove('visible');
                }
                const searchHint = document.getElementById('search-hint');
                if (searchHint) {
                    searchHint.style.display = 'flex';
                }
                return;
            }
            
            if (query.length >= 2) {
                // Buscar cuando hay al menos 2 caracteres
                performLiveSearch(query);
            }
        });
    }
    
    // También agregar búsqueda en tiempo real al input del header
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length >= 2) {
                // Abrir sidebar usando la función (con keepValue=true)
                openSearchSidebar(true);
                
                // Actualizar el input del sidebar SIN cambiar el foco
                if (searchSidebarInput) {
                    searchSidebarInput.value = query;
                }
                // Realizar búsqueda
                performLiveSearch(query);
            }
        });
    }
    
    // Función de búsqueda en vivo (mientras escribes) - BÚSQUEDA GLOBAL
    async function performLiveSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        // Ocultar hint inicial
        const searchHint = document.getElementById('search-hint');
        if (searchHint) {
            searchHint.style.display = 'none';
        }
        
        try {
            // Buscar en la API para obtener TODOS los productos
            const API_URL = 'https://recirculate-api.onrender.com/api/productos';
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error('Error al buscar productos');
            }
            
            const productos = await response.json();
            
            // Filtrar productos que coincidan con la búsqueda
            const results = productos
                .filter(producto => {
                    const nombre = (producto.nombre || '').toLowerCase();
                    const categoria = (producto.categoria || '').toLowerCase();
                    const genero = (producto.genero || '').toLowerCase();
                    
                    // Buscar en nombre, categoría y género
                    return nombre.includes(searchTerm) || 
                           categoria.includes(searchTerm) ||
                           genero.includes(searchTerm) ||
                           // Buscar por palabras individuales en el nombre
                           searchTerm.split(' ').every(word => nombre.includes(word));
                })
                .slice(0, 8) // Limitar a 8 resultados
                .map(producto => {
                    // Generar slug del producto
                    const normalizedName = (producto.nombre || '').replace(/B&N/gi, 'BN');
                    const productSlug = normalizedName
                        .toLowerCase()
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    
                    // Determinar ruta según categoría y género (USAR RUTAS ABSOLUTAS)
                    let productPath = '';
                    const categoria = (producto.categoria || '').toLowerCase();
                    const genero = (producto.genero || '').toLowerCase();
                    
                    if (genero === 'mujer') {
                        if (categoria.includes('vestido') || categoria.includes('mono')) {
                            productPath = `productos/mujer/vestidos-monos/${productSlug}.html`;
                        } else if (categoria.includes('remera') || categoria.includes('top')) {
                            productPath = `productos/mujer/remeras-tops/${productSlug}.html`;
                        } else if (categoria.includes('pollera') || categoria.includes('short')) {
                            productPath = `productos/mujer/polleras-shorts/${productSlug}.html`;
                        } else {
                            productPath = `productos/mujer/vestidos-monos/${productSlug}.html`;
                        }
                    } else if (genero === 'hombre') {
                        if (categoria.includes('pantalon') || categoria.includes('jean')) {
                            productPath = `productos/hombre/pantalones/${productSlug}.html`;
                        } else if (categoria.includes('remera')) {
                            productPath = `productos/hombre/remeras/${productSlug}.html`;
                        } else if (categoria.includes('buzo') || categoria.includes('hoodie')) {
                            productPath = `productos/hombre/buzos/${productSlug}.html`;
                        } else if (categoria.includes('campera') || categoria.includes('jacket')) {
                            productPath = `productos/hombre/camperas/${productSlug}.html`;
                        } else if (categoria.includes('camisa')) {
                            productPath = `productos/hombre/camisas/${productSlug}.html`;
                        } else {
                            productPath = `productos/hombre/pantalones/${productSlug}.html`;
                        }
                    } else if (genero === 'unisex') {
                        productPath = `productos/unisex/${productSlug}.html`;
                    } else {
                        productPath = `productos/${productSlug}.html`;
                    }
                    
                    // Resolver la ruta usando la función resolveMappedUrl para que funcione desde cualquier página
                    const resolvedUrl = resolveMappedUrl(productPath);
                    
                    return {
                        name: producto.nombre,
                        url: resolvedUrl,
                        img: producto.imagen_principal || '', // Cloudinary devuelve URL completa, no necesita prefijo
                        price: `$${producto.precio?.toLocaleString('es-AR')} ARS`
                    };
                });
            
            if (results.length > 0) {
                renderSearchResults(results);
            } else {
                // Mostrar mensaje de "no resultados" solo si hay al menos 3 caracteres
                if (searchTerm.length >= 3) {
                    if (searchResultsContainer) {
                        searchResultsContainer.innerHTML = `
                            <div class="no-results">
                                <p>No se encontraron productos con "<strong>${query}</strong>"</p>
                                <p class="search-hint">Intenta buscar por:</p>
                                <ul class="search-hints">
                                    <li>Nombre del producto (ej: "buzo", "remera")</li>
                                    <li>Categoría (ej: "pantalones", "vestidos")</li>
                                    <li>Género (ej: "mujer", "hombre", "unisex")</li>
                                </ul>
                            </div>
                        `;
                        searchResultsContainer.classList.add('visible');
                    }
                } else {
                    // Si hay menos de 3 caracteres, limpiar resultados
                    if (searchResultsContainer) {
                        searchResultsContainer.innerHTML = '';
                        searchResultsContainer.classList.remove('visible');
                    }
                }
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            // Fallback: buscar en la página actual si falla la API
            const catalog = getProductsFromPage();
            const results = catalog
                .filter(item => {
                    const name = item.name.toLowerCase();
                    return name.includes(searchTerm) || 
                           searchTerm.split(' ').every(word => name.includes(word));
                })
                .slice(0, 8);
            
            if (results.length > 0) {
                renderSearchResults(results);
            }
        }
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
    // (Movida a función global al inicio del archivo)
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
            
            // Determinar la ruta según la categoría
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
                // Para la página general de hombre, detectar tipo de producto por nombre
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
                // Para la página general de mujer, detectar tipo de producto por nombre
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
                // Para páginas de INGRESOS y DESCUENTOS, detectar categoría por nombre del producto
                const lowerName = productName.toLowerCase();
                
                // Detectar productos de MUJER
                if (lowerName.includes('vestido') || lowerName.includes('mono')) {
                    productPath = `../../productos/mujer/vestidos-monos/${productSlug}.html`;
                } else if (lowerName.includes('top')) {
                    productPath = `../../productos/mujer/remeras-tops/${productSlug}.html`;
                } else if (lowerName.includes('pollera') || lowerName.includes('short') || lowerName.includes('skort')) {
                    productPath = `../../productos/mujer/polleras-shorts/${productSlug}.html`;
                } 
                // Detectar productos de HOMBRE
                else if (lowerName.includes('pantalon') || lowerName.includes('jean')) {
                    productPath = `../../productos/hombre/pantalones/${productSlug}.html`;
                } else if (lowerName.includes('remera')) {
                    productPath = `../../productos/hombre/remeras/${productSlug}.html`;
                } else if (lowerName.includes('buzo') || lowerName.includes('hoodie')) {
                    productPath = `../../productos/hombre/buzos/${productSlug}.html`;
                } else if (lowerName.includes('campera') || lowerName.includes('jacket')) {
                    productPath = `../../productos/hombre/camperas/${productSlug}.html`;
                } else if (lowerName.includes('camisa')) {
                    productPath = `../../productos/hombre/camisas/${productSlug}.html`;
                } else {
                    productPath = `../../productos/hombre/pantalones/${productSlug}.html`; // Fallback
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