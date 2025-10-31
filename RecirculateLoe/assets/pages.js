
// pages.js - Lógica para páginas de categoría (Remeras, Buzos, etc.)

// ============================================
// FUNCIONES GLOBALES (Definidas fuera de DOMContentLoaded)
// ============================================
// --- Funciones del Carrito y Notificaciones de Nico ---
    let carrito = JSON.parse(localStorage.getItem('recirculate_carrito') || '[]');
    // pages.js - Lógica avanzada y unificada para páginas de categoría (Remeras, Buzos, etc.)
    // Mantiene lo mejor de ambas ramas, sin duplicados ni conflictos.

    // ============================================
    // FUNCIONES GLOBALES
    // ============================================

    function agregarAlCarrito(producto) {
        let carrito = JSON.parse(localStorage.getItem('recirculate_carrito') || '[]');
        // Buscar por ID o nombre
        const productoExistente = carrito.find(item => item.id === producto.id || item.nombre === producto.nombre);
        if (productoExistente) {
            productoExistente.cantidad++;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }
        localStorage.setItem('recirculate_carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
        mostrarNotificacion('✔ Producto agregado al carrito');
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

    function setupScrollAnimation() {
        const elementsToAnimate = document.querySelectorAll('.product-card, .benefit-item');
        if (elementsToAnimate.length === 0) return;
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

    function filterProducts(minPrice, maxPrice, selectedColors, selectedSizes) {
        const productCards = document.querySelectorAll('.product-card');
        let visibleCount = 0;
        productCards.forEach(card => {
            const precioTexto = card.querySelector('.precio')?.textContent || '$0 ARS';
            const precio = parseFloat(precioTexto.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
            const color = card.dataset.color || '';
            const talle = card.dataset.talle || '';
            let cumpleFiltros = true;
            if (precio < minPrice || precio > maxPrice) cumpleFiltros = false;
            if (selectedColors.length > 0 && !selectedColors.includes(color.toLowerCase())) cumpleFiltros = false;
            if (selectedSizes.length > 0 && !selectedSizes.includes(talle.toUpperCase())) cumpleFiltros = false;
            if (cumpleFiltros) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        const productGrid = document.querySelector('.product-grid');
        let noResultsMsg = document.querySelector('.no-results-message');
        if (visibleCount === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results-message';
                noResultsMsg.style.cssText = `grid-column: 1 / -1; text-align: center; padding: 3rem; font-size: 1.2rem; color: #666;`;
                noResultsMsg.textContent = 'No se encontraron productos con los filtros seleccionados.';
                productGrid.appendChild(noResultsMsg);
            }
        } else {
            if (noResultsMsg) noResultsMsg.remove();
        }
        mostrarNotificacion(`✔ Filtros aplicados: ${visibleCount} producto(s) encontrado(s)`);
    }

    function getCurrentCategory() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/remeras/')) return 'remeras';
        if (currentPath.includes('/buzos/')) return 'buzos';
        if (currentPath.includes('/pantalones/')) return 'pantalones';
        if (currentPath.includes('/camperas/')) return 'camperas';
        if (currentPath.includes('/camisas/')) return 'camisas';
        if (currentPath.includes('/vestidos/') || currentPath.includes('/Mvestidos/')) return 'vestidos';
        if (currentPath.includes('/polleras/') || currentPath.includes('/Mpolleras/')) return 'polleras';
        if (currentPath.includes('/Mremeras/')) return 'remeras';
        if (currentPath.includes('/hombre/')) return 'hombre';
        if (currentPath.includes('/mujer/')) return 'mujer';
        if (currentPath.includes('/unisex/')) return 'unisex';
        return 'general';
    }

    async function cargarProductosPorGenero(genero) {
        const API_URL = "https://recirculate-api.onrender.com/api/productos";
        const productGrid = document.querySelector('.product-grid');
        if (!productGrid) return;
        try {
            productGrid.innerHTML = '<div class="loading-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem; font-size: 1.2rem; color: #666;">Cargando productos...</div>';
            let url = API_URL;
            if (genero && genero !== 'todos') {
                url = `${API_URL}/genero/${genero}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar productos');
            let productos = await response.json();
            const categoriaActual = getCurrentCategory();
            if (categoriaActual && categoriaActual !== 'general' && categoriaActual !== 'hombre' && categoriaActual !== 'mujer' && categoriaActual !== 'unisex') {
                productos = productos.filter(producto => {
                    const cat = (producto.categoria || '').toLowerCase();
                    const gen = (producto.genero || '').toLowerCase();
                    return gen === genero.toLowerCase() && cat === categoriaActual.toLowerCase();
                });
            }
            productGrid.innerHTML = '';
            if (productos.length === 0) {
                productGrid.innerHTML = '<div class="no-products-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem; font-size: 1.2rem; color: #666;">No hay productos disponibles en esta sección.</div>';
                return;
            }
            productos.forEach((producto, index) => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.dataset.precio = producto.precio || 0;
                productCard.dataset.color = (producto.color || '').toLowerCase();
                productCard.dataset.talle = (producto.talle || '').toUpperCase();
                productCard.dataset.originalOrder = index;
                productCard.dataset.descuento = 0;
                productCard.dataset.isNew = 'false';
                let discountHtml = '';
                if (producto.descuento && producto.descuento > 0) {
                    discountHtml = `<div class="discount-tag">${producto.descuento}% OFF</div>`;
                    productCard.dataset.descuento = producto.descuento;
                }
                let newHtml = '';
                if (producto.es_nuevo || producto.es_destacado) {
                    newHtml = `<div class="new-tag">NEW</div>`;
                    productCard.dataset.isNew = 'true';
                }
                productCard.innerHTML = `
                    ${discountHtml}
                    ${newHtml}
                    <div class="product-images">
                        <img src="${producto.imagen_url || '../../assets/images/placeholder.png'}" alt="${producto.nombre}" class="main-image">
                        <img src="${producto.imagen_hover || producto.imagen_url || '../../assets/images/placeholder.png'}" alt="${producto.nombre} Hover" class="hover-image">
                    </div>
                    <h3>${producto.nombre}</h3>
                    <p class="precio">$${(producto.precio || 0).toLocaleString('es-AR')} ARS</p>
                    <button class="add-to-cart-btn">Añadir al carrito</button>
                `;
                productGrid.appendChild(productCard);
            });
            aplicarEventListenersProductos();
            setupScrollAnimation();
        } catch (error) {
            console.error('Error al cargar productos:', error);
            productGrid.innerHTML = '<div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem; font-size: 1.2rem; color: #e74c3c;">Error al cargar productos. Intenta recargar la página.</div>';
        }
    }

    function aplicarEventListenersProductos() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach((button, index) => {
            button.replaceWith(button.cloneNode(true));
            const newButton = document.querySelectorAll('.add-to-cart-btn')[index];
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const productCard = newButton.closest('.product-card');
                const nombre = productCard.querySelector('h3').textContent;
                const precioTexto = productCard.querySelector('.precio').textContent;
                const precio = parseFloat(precioTexto.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
                const imagen = productCard.querySelector('.main-image').src;
                const producto = {
                    id: `prod_${Date.now()}_${index}`,
                    nombre: nombre,
                    precio: precio,
                    imagen: imagen,
                    categoria: 'Producto'
                };
                agregarAlCarrito(producto);
            });
        });
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart-btn')) {
                    return;
                }
                if (window.userMenuManager && window.userMenuManager.isLoggedIn) {
                    const productData = {
                        id: card.dataset.productId || Date.now(),
                        nombre: card.querySelector('h3').textContent.trim(),
                        imagen_url: card.querySelector('.main-image').src,
                        precio: parseInt(card.querySelector('.precio').textContent.replace(/[^\d]/g, '')),
                        categoria: getCurrentCategory()
                    };
                    window.userMenuManager.trackProductVisit(productData);
                }
                const productName = card.querySelector('h3').textContent.trim();
                const normalizedName = productName.replace(/B&N/gi, 'BN');
                const productSlug = normalizedName
                    .toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                const currentPath = window.location.pathname;
                let productPath = '';
                if (currentPath.includes('/hombre/')) {
                    productPath = `../../productos/hombre/general/${productSlug}.html`;
                } else if (currentPath.includes('/mujer/')) {
                    productPath = `../../productos/mujer/general/${productSlug}.html`;
                } else if (currentPath.includes('/unisex/')) {
                    productPath = `../../productos/unisex/${productSlug}.html`;
                } else {
                    productPath = `../../productos/${productSlug}.html`;
                }
                window.location.href = productPath;
            });
            card.style.cursor = 'pointer';
        });
    }

    // ============================================
    // LÓGICA PRINCIPAL (Dentro de DOMContentLoaded)
    // ============================================
    document.addEventListener("DOMContentLoaded", function() {
        actualizarContadorCarrito();
        const currentPath = window.location.pathname;
        let generoActual = null;
        if (currentPath.includes('/hombre/')) {
            generoActual = 'hombre';
        } else if (currentPath.includes('/mujer/')) {
            generoActual = 'mujer';
        } else if (currentPath.includes('/unisex/')) {
            generoActual = 'unisex';
        }
        if (generoActual && document.querySelector('.product-grid')) {
            cargarProductosPorGenero(generoActual);
        } else {
            aplicarEventListenersProductos();
        }
        const chatbotContainer = document.querySelector('.chatbot-container');
        const logo = document.querySelector('.header-logo');
        if (logo) {
            logo.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = '../home/home.html';
            });
        }
        const body = document.body;
        const overlay = document.querySelector('.overlay');
        function closeAnyOpenSidebar() {
            const openSidebars = document.querySelectorAll('.sidebar.open, .filter-sidebar.open');
            openSidebars.forEach(sb => sb.classList.remove('open'));
            body.classList.remove('sidebar-active');
            if (overlay) overlay.style.zIndex = 1000;
            if (chatbotContainer) {
                chatbotContainer.style.display = 'block';
            }
        }
        if (overlay) {
            overlay.addEventListener('click', closeAnyOpenSidebar);
        }
        window.addEventListener('click', (event) => {
            const sidebar = document.getElementById('sidebar-menu');
            const filterSidebar = document.getElementById('filter-sidebar');
            const menuBtn = document.getElementById('menu-btn');
            const filterBtn = document.querySelector('.filter-btn');
            let clickedInsideSidebar = (sidebar && sidebar.contains(event.target)) || 
                                       (filterSidebar && filterSidebar.contains(event.target)) ||
                                       event.target === menuBtn || (menuBtn && menuBtn.contains(event.target)) ||
                                       event.target === filterBtn || (filterBtn && filterBtn.contains(event.target));
            if (!clickedInsideSidebar && body.classList.contains('sidebar-active')) {
                 closeAnyOpenSidebar();
            }
        });
        const menuBtn = document.getElementById('menu-btn');
        const closeBtn = document.getElementById('close-btn');
        const sidebar = document.getElementById('sidebar-menu');
        const categoryHeaders = document.querySelectorAll('.sidebar-category-header');
        if (menuBtn && sidebar) {
            menuBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                closeAnyOpenSidebar();
                sidebar.classList.add('open');
                body.classList.add('sidebar-active');
                if (overlay) overlay.style.zIndex = 1000;
            });
        }
        if (closeBtn) closeBtn.addEventListener('click', closeAnyOpenSidebar);
        categoryHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const parentCategory = header.closest('.sidebar-category');
                const isActive = parentCategory.classList.contains('active');
                document.querySelectorAll('.sidebar-category').forEach(cat => cat.classList.remove('active'));
                if (!isActive) {
                     parentCategory.classList.add('active');
                }
            });
        });
        const filterBtn = document.querySelector('.filter-btn');
        const filterSidebar = document.getElementById('filter-sidebar');
        const closeFilterBtn = document.getElementById('close-filter-btn');
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        if (filterBtn && filterSidebar) {
            filterBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                closeAnyOpenSidebar();
                filterSidebar.classList.add('open');
                body.classList.add('sidebar-active');
                if (overlay) overlay.style.zIndex = 1000;
                if (chatbotContainer) {
                    chatbotContainer.style.display = 'none';
                }
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
                filterProducts(minPrice, maxPrice, selectedColors, selectedSizes);
                closeAnyOpenSidebar(); 
            });
        }
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                document.querySelectorAll('.filter-option.selected').forEach(option => {
                    option.classList.remove('selected');
                });
                const minPriceInput = document.getElementById('min-price');
                const maxPriceInput = document.getElementById('max-price');
                if (minPriceInput) minPriceInput.value = '30000';
                if (maxPriceInput) maxPriceInput.value = '50000';
                document.querySelectorAll('.product-card').forEach(card => {
                    card.style.display = 'block';
                });
                const noResultsMsg = document.querySelector('.no-results-message');
                if (noResultsMsg) {
                    noResultsMsg.remove();
                }
                mostrarNotificacion('✓ Filtros limpiados');
                closeAnyOpenSidebar();
            });
        }
        const searchContainer = document.getElementById('search-container');
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        function performSearch(query) {
            const searchTerm = query.toLowerCase();
            const searchMap = {
                'remera': '../remeras/remeras.html', 'remeras': '../remeras/remeras.html',
                'pantalon': '../pantalones/pantalones.html', 'pantalones': '../pantalones/pantalones.html',
                'buzo': '../buzos/buzos.html', 'buzos': '../buzos/buzos.html',
                'camisa': '../camisas/camisas.html', 'camisas': '../camisas/camisas.html',
                'campera': '../camperas/camperas.html', 'camperas': '../camperas/camperas.html',
                'jacket': '../camperas/camperas.html', 'hoodie': '../buzos/buzos.html',
                'sudadera': '../buzos/buzos.html', 'polo': '../camisas/camisas.html',
                'shirt': '../remeras/remeras.html', 'jean': '../pantalones/pantalones.html',
                'jeans': '../pantalones/pantalones.html', 'jogger': '../pantalones/pantalones.html',
                'home': '../home/home.html', 'inicio': '../home/home.html'
            };
            if (searchMap[searchTerm]) {
                window.location.href = searchMap[searchTerm];
                return;
            }
            for (const [key, url] of Object.entries(searchMap)) {
                if (key.includes(searchTerm) || searchTerm.includes(key)) {
                    window.location.href = url;
                    return;
                }
            }
            alert(`No se encontraron resultados para "${query}". Intenta buscar: remeras, pantalones, buzos, camisas o camperas.`);
        }
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const isExpanded = searchContainer.classList.contains('active');
                if (isExpanded && searchInput.value !== '') {
                    performSearch(searchInput.value.trim());
                } else {
                    searchContainer.classList.toggle('active');
                    if (searchContainer.classList.contains('active')) {
                        searchInput.focus();
                    }
                }
            });
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && searchInput.value.trim() !== '') {
                    performSearch(searchInput.value.trim());
                }
            });
        }
        const ordenarSelect = document.getElementById('ordenar');
        const productGrid = document.querySelector('.product-grid');
        if (ordenarSelect && productGrid) {
            let originalOrder = [];
            function assignProductData() {
                const cards = productGrid.querySelectorAll('.product-card');
                originalOrder = Array.from(cards);
                cards.forEach((card, index) => {
                    const precioTexto = card.querySelector('.precio')?.textContent || '$0 ARS';
                    const descuentoTag = card.querySelector('.discount-tag')?.textContent || '0%';
                    const newTag = card.querySelector('.new-tag');
                    const precio = parseFloat(precioTexto.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
                    card.dataset.precio = precio;
                    const descuento = parseFloat(descuentoTag.replace(/[^0-9.]/g, '')) || 0;
                    card.dataset.descuento = descuento;
                    card.dataset.isNew = newTag ? 'true' : 'false';
                    card.dataset.originalOrder = index;
                });
            }
            assignProductData();
            ordenarSelect.addEventListener('change', (e) => {
                sortProducts(e.target.value);
            });
            function sortProducts(criteria) {
                const products = Array.from(productGrid.querySelectorAll('.product-card'));
                if (criteria === 'default') {
                    products.sort((a, b) => {
                        return parseInt(a.dataset.originalOrder) - parseInt(b.dataset.originalOrder);
                    });
                } else if (criteria === 'precio-asc' || criteria === 'precio-desc') {
                    const isAsc = criteria === 'precio-asc';
                    products.sort((a, b) => {
                        const priceA = parseFloat(a.dataset.precio);
                        const priceB = parseFloat(b.dataset.precio);
                        return isAsc ? priceA - priceB : priceB - priceA;
                    });
                } else if (criteria === 'descuento-asc' || criteria === 'descuento-desc') {
                    const conDescuento = products.filter(p => parseFloat(p.dataset.descuento) > 0);
                    const sinDescuento = products.filter(p => parseFloat(p.dataset.descuento) === 0);
                    const isAsc = criteria === 'descuento-asc';
                    conDescuento.sort((a, b) => {
                        const discountA = parseFloat(a.dataset.descuento);
                        const discountB = parseFloat(b.dataset.descuento);
                        return isAsc ? discountA - discountB : discountB - discountA;
                    });
                    sinDescuento.sort((a, b) => {
                        const priceA = parseFloat(a.dataset.precio);
                        const priceB = parseFloat(b.dataset.precio);
                        return priceA - priceB;
                    });
                    products.length = 0;
                    products.push(...conDescuento, ...sinDescuento);
                } else if (criteria === 'nuevos') {
                    const nuevos = products.filter(p => p.dataset.isNew === 'true');
                    const normales = products.filter(p => p.dataset.isNew === 'false');
                    nuevos.sort((a, b) => {
                        const priceA = parseFloat(a.dataset.precio);
                        const priceB = parseFloat(b.dataset.precio);
                        return priceA - priceB;
                    });
                    normales.sort((a, b) => {
                        const priceA = parseFloat(a.dataset.precio);
                        const priceB = parseFloat(b.dataset.precio);
                        return priceA - priceB;
                    });
                    products.length = 0;
                    products.push(...nuevos, ...normales);
                }
                products.forEach(card => productGrid.appendChild(card));
            }
        }
        setupScrollAnimation();
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart-btn')) {
                    return;
                }
                const productName = card.querySelector('h3').textContent.trim();
                const normalizedName = productName.replace(/B&N/gi, 'BN');
                const productSlug = normalizedName
                    .toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                const currentPath = window.location.pathname;
                let productPath = '';
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
                        productPath = `../../productos/hombre/pantalones/${productSlug}.html`;
                    }
                } else if (currentPath.includes('/mujer/')) {
                    if (productName.toLowerCase().includes('vestido') || productName.toLowerCase().includes('mono')) {
                        productPath = `../../productos/mujer/vestidos-monos/${productSlug}.html`;
                    } else if (productName.toLowerCase().includes('remera') || productName.toLowerCase().includes('top')) {
                        productPath = `../../productos/mujer/remeras-tops/${productSlug}.html`;
                    } else if (productName.toLowerCase().includes('pollera') || productName.toLowerCase().includes('short') || productName.toLowerCase().includes('skort')) {
                        productPath = `../../productos/mujer/polleras-shorts/${productSlug}.html`;
                    } else {
                        productPath = `../../productos/mujer/vestidos-monos/${productSlug}.html`;
                    }
                } else if (currentPath.includes('/ingresos/') || currentPath.includes('/descuentos/')) {
                    const lowerName = productName.toLowerCase();
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
                    } else {
                        productPath = `../../productos/hombre/pantalones/${productSlug}.html`;
                    }
                } else {
                    productPath = `../../productos/${productSlug}.html`;
                }
                window.location.href = productPath;
            });
            card.style.cursor = 'pointer';
            const addBtn = card.querySelector('.add-to-cart-btn');
            if (addBtn) {
                addBtn.style.cursor = 'pointer';
            }
        });
        const chatbotToggle = document.getElementById('chatbot-toggle');
        const chatbotWindow = document.getElementById('chatbot-window');
        const chatbotClose = document.getElementById('chatbot-close');
        if (chatbotContainer) { 
            if (chatbotToggle && chatbotWindow) {
                chatbotToggle.addEventListener('click', () => {
                    chatbotWindow.classList.toggle('active');
                });
            }
            if (chatbotClose && chatbotWindow) {
                chatbotClose.addEventListener('click', () => {
                    chatbotWindow.classList.remove('active');
                });
            }
            window.addEventListener('click', (event) => {
                if (chatbotWindow && chatbotWindow.classList.contains('active') && !chatbotContainer.contains(event.target)) {
                     chatbotWindow.classList.remove('active');
                }
            });
        }
    });
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
    
    // --- Detectar género automáticamente y cargar productos desde API ---
    const currentPath = window.location.pathname;
    let generoActual = null;
    
    if (currentPath.includes('/hombre/')) {
        generoActual = 'hombre';
    } else if (currentPath.includes('/mujer/')) {
        generoActual = 'mujer';
    } else if (currentPath.includes('/unisex/')) {
        generoActual = 'unisex';
    }
    
    // Cargar productos dinámicamente si estamos en una página de género
    if (generoActual && document.querySelector('.product-grid')) {
        cargarProductosPorGenero(generoActual);
    } else {
        // Si no es página de género, aplicar listeners a productos estáticos existentes
        aplicarEventListenersProductos();
    }

    // --- Referencias globales del DOM ---
    const chatbotContainer = document.querySelector('.chatbot-container');

    // --- Lógica del Logo ---
    const logo = document.querySelector('.header-logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.stopPropagation();
            // Siempre redirige al home desde páginas de categoría
            window.location.href = '../home/home.html'; 
        });
    }
    
    // --- Lógica Común Sidebars y Overlay ---
    const body = document.body;
    const overlay = document.querySelector('.overlay');
    
    // Función genérica para cerrar cualquier sidebar activo
    function closeAnyOpenSidebar() {
        const openSidebars = document.querySelectorAll('.sidebar.open, .filter-sidebar.open');
        openSidebars.forEach(sb => sb.classList.remove('open'));
        body.classList.remove('sidebar-active');
        if (overlay) overlay.style.zIndex = 1000; // Restaura z-index del overlay general
        
        // Mostrar el chatbot cuando se cierra cualquier sidebar
        if (chatbotContainer) {
            chatbotContainer.style.display = 'block';
        }
    }

    if (overlay) {
        overlay.addEventListener('click', closeAnyOpenSidebar);
    }
    
    // Cerrar sidebars al hacer clic fuera
    window.addEventListener('click', (event) => {
        const sidebar = document.getElementById('sidebar-menu');
        const filterSidebar = document.getElementById('filter-sidebar');
        const menuBtn = document.getElementById('menu-btn');
        const filterBtn = document.querySelector('.filter-btn');

        let clickedInsideSidebar = (sidebar && sidebar.contains(event.target)) || 
                                   (filterSidebar && filterSidebar.contains(event.target)) ||
                                   event.target === menuBtn || (menuBtn && menuBtn.contains(event.target)) ||
                                   event.target === filterBtn || (filterBtn && filterBtn.contains(event.target));

        if (!clickedInsideSidebar && body.classList.contains('sidebar-active')) {
             closeAnyOpenSidebar();
        }
    });


    // --- Lógica Específica: Sidebar de Categorías (Izquierdo) ---
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const sidebar = document.getElementById('sidebar-menu');
    const categoryHeaders = document.querySelectorAll('.sidebar-category-header');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            closeAnyOpenSidebar(); // Cierra otros sidebars primero
            sidebar.classList.add('open');
            body.classList.add('sidebar-active');
            if (overlay) overlay.style.zIndex = 1000;
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeAnyOpenSidebar);

    categoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const parentCategory = header.closest('.sidebar-category');
            const isActive = parentCategory.classList.contains('active');
            
            // Cierra todos antes de abrir/cerrar el actual
            document.querySelectorAll('.sidebar-category').forEach(cat => cat.classList.remove('active'));
            
            if (!isActive) {
                 parentCategory.classList.add('active');
            }
        });
    });

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
            if (overlay) overlay.style.zIndex = 1000; // Asegura que esté detrás del filtro
            
            // Ocultar el chatbot cuando se abre el sidebar de filtros
            if (chatbotContainer) {
                chatbotContainer.style.display = 'none';
            }
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

    // --- Lógica para el Buscador Integrado ---
    const searchContainer = document.getElementById('search-container');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    function performSearch(query) {
        const searchTerm = query.toLowerCase();
        const searchMap = {
            'remera': '../remeras/remeras.html', 'remeras': '../remeras/remeras.html',
            'pantalon': '../pantalones/pantalones.html', 'pantalones': '../pantalones/pantalones.html',
            'buzo': '../buzos/buzos.html', 'buzos': '../buzos/buzos.html',
            'camisa': '../camisas/camisas.html', 'camisas': '../camisas/camisas.html',
            'campera': '../camperas/camperas.html', 'camperas': '../camperas/camperas.html',
            'jacket': '../camperas/camperas.html', 'hoodie': '../buzos/buzos.html',
            'sudadera': '../buzos/buzos.html', 'polo': '../camisas/camisas.html',
            'shirt': '../remeras/remeras.html', 'jean': '../pantalones/pantalones.html',
            'jeans': '../pantalones/pantalones.html', 'jogger': '../pantalones/pantalones.html',
            'home': '../home/home.html', 'inicio': '../home/home.html'
        };

        if (searchMap[searchTerm]) {
            window.location.href = searchMap[searchTerm];
            return;
        }
        for (const [key, url] of Object.entries(searchMap)) {
            if (key.includes(searchTerm) || searchTerm.includes(key)) {
                window.location.href = url;
                return;
            }
        }
        alert(`No se encontraron resultados para "${query}". Intenta buscar: remeras, pantalones, buzos, camisas o camperas.`);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const isExpanded = searchContainer.classList.contains('active');
            if (isExpanded && searchInput.value !== '') {
                performSearch(searchInput.value.trim());
            } else {
                searchContainer.classList.toggle('active');
                if (searchContainer.classList.contains('active')) {
                    searchInput.focus();
                }
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim() !== '') {
                performSearch(searchInput.value.trim());
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

    // --- Lógica para el Chatbot ---
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
      
    if (chatbotContainer) { 
        if (chatbotToggle && chatbotWindow) {
            chatbotToggle.addEventListener('click', () => {
                chatbotWindow.classList.toggle('active');
            });
        }
        if (chatbotClose && chatbotWindow) {
            chatbotClose.addEventListener('click', () => {
                chatbotWindow.classList.remove('active');
            });
        }
        // Cerrar al hacer clic fuera del chatbot
        window.addEventListener('click', (event) => {
            if (chatbotWindow && chatbotWindow.classList.contains('active') && !chatbotContainer.contains(event.target)) {
                 chatbotWindow.classList.remove('active');
            }
        });
    }

}); // Fin del DOMContentLoaded
// End of file
document.addEventListener("DOMContentLoaded", function() {
  // --- Cargar contador del carrito al inicio ---
  actualizarContadorCarrito();

  // --- Scroll suave al hacer click en el logo ---
  const logo = document.querySelector('.header-logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = '../home/home.html';
    });
  }

  // --- Lógica para el panel lateral (Sidebar) ---
  const menuBtn = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('close-btn');
  const sidebar = document.getElementById('sidebar-menu');
  const body = document.body;
  const overlay = document.querySelector('.overlay');

  function openSidebar() {
    sidebar.classList.add('open');
    body.classList.add('sidebar-active');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    body.classList.remove('sidebar-active');
  }
  
  if (menuBtn) menuBtn.addEventListener('click', (event) => { event.stopPropagation(); openSidebar(); });
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  window.addEventListener('click', (event) => {
    if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(event.target) && event.target !== menuBtn) {
      closeSidebar();
    }
  });

  // --- Lógica para el Buscador Integrado ---
  const searchContainer = document.getElementById('search-container');
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const isExpanded = searchContainer.classList.contains('active');
      if (isExpanded && searchInput.value !== '') {
        performSearch(searchInput.value.trim());
      } else {
        searchContainer.classList.toggle('active');
        if (searchContainer.classList.contains('active')) {
          searchInput.focus();
        }
      }
    });
  }

  // Buscar al presionar Enter
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        performSearch(searchInput.value.trim());
      }
    });
  }

  // Función para realizar la búsqueda desde páginas de productos
  function performSearch(query) {
    const searchTerm = query.toLowerCase();
    
    // Mapeo de términos de búsqueda a páginas (rutas relativas desde páginas de productos)
    const searchMap = {
      'remera': '../remeras/remeras.html',
      'remeras': '../remeras/remeras.html',
      'pantalon': '../pantalones/pantalones.html',
      'pantalones': '../pantalones/pantalones.html',
      'buzo': '../buzos/buzos.html',
      'buzos': '../buzos/buzos.html',
      'camisa': '../camisas/camisas.html',
      'camisas': '../camisas/camisas.html',
      'campera': '../camperas/camperas.html',
      'camperas': '../camperas/camperas.html',
      'jacket': '../camperas/camperas.html',
      'hoodie': '../buzos/buzos.html',
      'sudadera': '../buzos/buzos.html',
      'polo': '../camisas/camisas.html',
      'shirt': '../remeras/remeras.html',
      'jean': '../pantalones/pantalones.html',
      'jeans': '../pantalones/pantalones.html',
      'jogger': '../pantalones/pantalones.html',
      'home': '../home/home.html',
      'inicio': '../home/home.html'
    };

    // Buscar coincidencia exacta
    if (searchMap[searchTerm]) {
      window.location.href = searchMap[searchTerm];
      return;
    }

    // Buscar coincidencias parciales
    for (const [key, url] of Object.entries(searchMap)) {
      if (key.includes(searchTerm) || searchTerm.includes(key)) {
        window.location.href = url;
        return;
      }
    }

    // Si no encuentra nada, mostrar mensaje
    alert(`No se encontraron resultados para "${query}". Intenta buscar: remeras, pantalones, buzos, camisas o camperas.`);
  }
  // --- Lógica para la animación al hacer scroll ---
  function setupScrollAnimation() {
    const elementsToAnimate = document.querySelectorAll('.product-card, .carrusel-item, .benefit-item');

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

  setupScrollAnimation();
});

  // --- Lógica para el Contador del Carrito ---
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

  addToCartButtons.forEach((button, index) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Obtener información del producto desde el DOM
      const productCard = button.closest('.product-card');
      const nombre = productCard.querySelector('h3').textContent;
      const precioTexto = productCard.querySelector('.precio').textContent;
      const precio = parseFloat(precioTexto.replace(/[^\d]/g, ''));
      const imagen = productCard.querySelector('.main-image').src;
      
      // Crear objeto producto
      const producto = {
        id: `prod_${Date.now()}_${index}`, // ID único basado en timestamp
        nombre: nombre,
        precio: precio,
        imagen: imagen,
        categoria: 'Ropa usada' // Puedes agregar más metadata después
      };
      
      // Agregar al carrito usando la función de utils.js
      agregarAlCarrito(producto);
    });
  });

  // ============================================
// FUNCIONES DEL CARRITO (copiadas de utils.js para compatibilidad)
// ============================================

function agregarAlCarrito(producto) {
  let carrito = JSON.parse(localStorage.getItem('recirculate_carrito') || '[]');
  
  const productoExistente = carrito.find(item => item.id === producto.id);
  
  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    carrito.push({
      ...producto,
      cantidad: 1
    });
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
    position: fixed;
    top: 100px;
    right: 20px;
    background: #27ae60;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: "Poppins", sans-serif;
  `;
}

