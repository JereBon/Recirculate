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


// ============================================
// LÓGICA PRINCIPAL (Dentro de DOMContentLoaded)
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    
    actualizarContadorCarrito(); // Carga inicial del contador

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
        });
    }
    if (closeFilterBtn) closeFilterBtn.addEventListener('click', closeAnyOpenSidebar);

    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.addEventListener('click', () => {
            option.classList.toggle('selected');
        });
    });

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            const minPrice = document.getElementById('min-price').value;
            const maxPrice = document.getElementById('max-price').value;
            const selectedColors = Array.from(document.querySelectorAll('.color-options .filter-option.selected')).map(el => el.dataset.color);
            const selectedSizes = Array.from(document.querySelectorAll('.size-options .filter-option.selected')).map(el => el.dataset.size);

            console.log('Filtros a aplicar:', { minPrice, maxPrice, colors: selectedColors, sizes: selectedSizes });
            alert('Aplicando filtros... (Lógica de filtrado no implementada aún)');
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

    // --- Lógica de Ordenamiento (Restaurada y Corregida) ---
    const ordenarSelect = document.getElementById('ordenar');
    const productGrid = document.querySelector('.product-grid');

    if (ordenarSelect && productGrid) {
        
        function assignProductData() {
            productGrid.querySelectorAll('.product-card').forEach(card => {
                const precioTexto = card.querySelector('.precio')?.textContent || '$0 ARS';
                const descuentoTag = card.querySelector('.discount-tag')?.textContent || '0%';
                
                const precio = parseFloat(precioTexto.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
                card.dataset.precio = precio;
                
                const descuento = parseFloat(descuentoTag.replace(/[^0-9.]/g, '')) || 0;
                card.dataset.descuento = descuento;
            });
        }
        assignProductData(); // Ejecutar al cargar

        ordenarSelect.addEventListener('change', (e) => {
            sortProducts(e.target.value);
        });

        function sortProducts(criteria) {
            const products = Array.from(productGrid.querySelectorAll('.product-card'));
            
            products.sort((a, b) => {
                const priceA = parseFloat(a.dataset.precio);
                const priceB = parseFloat(b.dataset.precio);
                const discountA = parseFloat(a.dataset.descuento);
                const discountB = parseFloat(b.dataset.descuento);

                switch (criteria) {
                    case 'precio-asc': return priceA - priceB;
                    case 'precio-desc': return priceB - priceA;
                    case 'descuento-asc': return discountA - discountB;
                    case 'descuento-desc': return discountB - discountA;
                    default: return 0;
                }
            });

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

    // --- Lógica para el Chatbot ---
    const chatbotContainer = document.querySelector('.chatbot-container');
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