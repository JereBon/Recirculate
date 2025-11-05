// producto-detalle-dinamico.js - Carga dinámica de productos desde la API
// Este archivo carga automáticamente los datos del producto basándose en el slug de la URL

document.addEventListener('DOMContentLoaded', async () => {
    const API_URL = 'https://recirculate-api.onrender.com/api/productos';

    // Obtener el slug desde la URL
    function getSlugFromUrl() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename.replace('.html', '');
    }

    // Generar slug desde nombre de producto (igual que en load-products.js)
    function generarSlug(nombre) {
        return nombre
            .replace(/B&N/gi, 'BN')
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Calcular precio con descuento
    function calcularPrecioConDescuento(precio, descuento) {
        if (!descuento || descuento <= 0) return precio;
        return precio * (1 - descuento / 100);
    }

    // Cargar y renderizar producto
    try {
        const slug = getSlugFromUrl();
        console.log('🔍 Buscando producto con slug:', slug);

        // Cargar todos los productos
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar productos');
        
        const productos = await response.json();
        
        // Buscar el producto que coincida con el slug
        const producto = productos.find(p => generarSlug(p.nombre) === slug);
        
        if (!producto) {
            console.error('❌ Producto no encontrado para slug:', slug);
            return;
        }

        console.log('✅ Producto encontrado:', producto);

        // Actualizar título de la página
        const tituloH1 = document.querySelector('.producto-info h1');
        if (tituloH1) {
            tituloH1.textContent = producto.nombre;
        }
        document.title = `${producto.nombre} - Recirculate`;

        // Actualizar imágenes
        const imagenPrincipal = document.querySelector('.imagen-principal img');
        const miniaturas = document.querySelectorAll('.miniatura img');
        
        if (imagenPrincipal) {
            imagenPrincipal.src = producto.imagen_frente_url || producto.imagen_url || '';
            imagenPrincipal.alt = producto.nombre;
        }

        if (miniaturas.length >= 1) {
            miniaturas[0].src = producto.imagen_frente_url || producto.imagen_url || '';
            miniaturas[0].alt = `${producto.nombre} - Vista frontal`;
        }
        if (miniaturas.length >= 2 && producto.imagen_espalda_url) {
            miniaturas[1].src = producto.imagen_espalda_url;
            miniaturas[1].alt = `${producto.nombre} - Vista trasera`;
        }

        // Actualizar precio con o sin descuento
        const precioContainer = document.querySelector('.producto-precio');
        if (precioContainer) {
            if (producto.descuento && producto.descuento > 0) {
                const precioConDescuento = calcularPrecioConDescuento(producto.precio, producto.descuento);
                precioContainer.innerHTML = `
                    <span class="precio-anterior" style="text-decoration: line-through; color: #e74c3c; font-size: 1rem; margin-right: 10px;">
                        $${producto.precio.toLocaleString('es-AR')} ARS
                    </span>
                    <span style="color: #27ae60; font-weight: bold;">
                        $${Math.round(precioConDescuento).toLocaleString('es-AR')} ARS
                    </span>
                `;
            } else {
                precioContainer.innerHTML = `
                    <span style="color: #ffd84d; font-weight: bold;">
                        $${producto.precio.toLocaleString('es-AR')} ARS
                    </span>
                `;
            }
        }

        // Mostrar/ocultar badge de descuento
        const etiquetasContainer = document.querySelector('.producto-etiquetas');
        if (etiquetasContainer) {
            if (producto.descuento && producto.descuento > 0) {
                etiquetasContainer.innerHTML = `
                    <span class="etiqueta-descuento">${Math.round(producto.descuento)}% OFF</span>
                `;
            } else {
                etiquetasContainer.innerHTML = '';
            }
        }

        // Actualizar data attributes para talle y stock
        const productoInfo = document.querySelector('.producto-info');
        if (productoInfo) {
            productoInfo.setAttribute('data-talle-disponible', producto.talle || '');
            productoInfo.setAttribute('data-stock-disponible', producto.stock || 999);
        }

        // Actualizar input de cantidad con el máximo
        const cantidadInput = document.getElementById('cantidad-input');
        if (cantidadInput) {
            cantidadInput.setAttribute('max', producto.stock || 999);
        }

        // Marcar el talle disponible y deshabilitar los demás
        const talleBtns = document.querySelectorAll('.talle-btn');
        const talleDisponible = (producto.talle || '').toUpperCase().trim();
        
        talleBtns.forEach(btn => {
            const talle = btn.dataset.talle;
            
            if (talleDisponible && talle !== talleDisponible) {
                btn.classList.add('talle-no-disponible');
                btn.style.opacity = '0.3';
                btn.style.cursor = 'not-allowed';
                btn.style.pointerEvents = 'none';
            } else if (talle === talleDisponible) {
                // Marcar visualmente el talle disponible
                btn.style.borderColor = '#27ae60';
                btn.style.borderWidth = '3px';
            }
        });

        // Actualizar descripción si existe
        const descripcionContainer = document.querySelector('.producto-descripcion-completa .producto-descripcion p');
        if (descripcionContainer && producto.descripcion) {
            descripcionContainer.textContent = producto.descripcion;
        }

        // Actualizar breadcrumbs
        const breadcrumbActual = document.querySelector('.breadcrumb-item.active');
        if (breadcrumbActual) {
            breadcrumbActual.textContent = producto.nombre;
        }

        // Agregar información adicional si existe
        const especificacionesUl = document.querySelector('.producto-especificaciones ul');
        if (especificacionesUl) {
            especificacionesUl.innerHTML = `
                ${producto.marca ? `<li><strong>Marca:</strong> ${producto.marca}</li>` : ''}
                ${producto.color ? `<li><strong>Color:</strong> ${producto.color}</li>` : ''}
                ${producto.talle ? `<li><strong>Talle disponible:</strong> ${producto.talle}</li>` : ''}
                ${producto.genero ? `<li><strong>Género:</strong> ${producto.genero.charAt(0).toUpperCase() + producto.genero.slice(1)}</li>` : ''}
                ${producto.categoria ? `<li><strong>Categoría:</strong> ${producto.categoria}</li>` : ''}
                ${producto.estado ? `<li><strong>Estado:</strong> ${producto.estado}</li>` : ''}
                <li><strong>Stock disponible:</strong> ${producto.stock || 0} unidades</li>
                ${producto.proveedor ? `<li><strong>Proveedor:</strong> ${producto.proveedor}</li>` : ''}
            `;
        }

        console.log('✅ Producto renderizado correctamente');
        
        // Disparar evento personalizado para que producto-detalle.js sepa que los datos están listos
        window.dispatchEvent(new CustomEvent('productoDataLoaded', { 
            detail: { 
                producto: producto,
                talleDisponible: talleDisponible,
                stockDisponible: producto.stock || 999
            } 
        }));

    } catch (error) {
        console.error('❌ Error al cargar producto:', error);
    }
});
