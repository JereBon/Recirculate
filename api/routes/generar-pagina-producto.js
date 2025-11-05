// generar-pagina-producto.js - Genera automáticamente la página HTML del producto
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Función para generar slug desde nombre
function generarSlug(nombre) {
    return nombre
        .replace(/B&N/gi, 'BN')
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Función para determinar la ruta según género y categoría
function determinarRuta(genero, categoria) {
    const gen = genero.toLowerCase();
    const cat = categoria.toLowerCase();
    
    if (gen === 'hombre') {
        if (cat === 'remeras') return 'hombre/remeras';
        if (cat === 'buzos') return 'hombre/buzos';
        if (cat === 'pantalones') return 'hombre/pantalones';
        if (cat === 'camperas') return 'hombre/camperas';
        if (cat === 'camisas') return 'hombre/camisas';
        return 'hombre/remeras';
    } else if (gen === 'mujer') {
        if (cat === 'remeras/tops') return 'mujer/remeras-tops';
        if (cat === 'vestidos/monos') return 'mujer/vestidos-monos';
        if (cat === 'polleras/shorts/skorts') return 'mujer/polleras-shorts';
        return 'mujer/remeras-tops';
    } else {
        return 'unisex';
    }
}

// Template HTML del producto
function generarHTMLProducto(producto) {
    const nivelProfundidad = producto.genero.toLowerCase() === 'unisex' ? '../../' : '../../../';
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${producto.nombre} - Recirculate</title>
    <link rel="stylesheet" href="${nivelProfundidad}assets/public-styles.css">
    <link rel="stylesheet" href="${nivelProfundidad}assets/producto-detalle.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>

<header class="public-header fixed-header">
    <nav class="header-nav">
        <div class="header-left">
            <button id="menu-btn" class="header-icon menu-icon"><i class="fas fa-bars"></i></button>
            <div id="search-container" class="search-container">
                <button id="search-btn" class="header-icon search-icon"><i class="fas fa-search"></i></button>
                <input type="text" id="search-input" class="search-input" placeholder="Buscar...">
            </div>
        </div>
        <a href="${nivelProfundidad}home/home.html" class="header-logo">
            <img src="${nivelProfundidad}assets/images/Recirculate-logo.png" alt="Recirculate Logo" class="logo-image">
        </a>
        <div class="header-right">
            <a href="${nivelProfundidad}auth/login.html" class="header-icon user-icon" data-tooltip="INICIAR SESIÓN"><i class="fas fa-user"></i></a>
            <a href="${nivelProfundidad}carrito/carrito.html" class="header-icon cart-icon">
                <i class="fas fa-shopping-cart"></i>
                <span id="cart-counter" class="cart-counter">0</span>
            </a>
        </div>
    </nav>
</header>

<div id="sidebar-menu" class="sidebar">
    <button id="close-btn" class="close-btn">&times;</button>
    
    <div class="sidebar-menu-list">
        <div class="sidebar-category" data-category="hombre">
            <div class="sidebar-category-header">
                <span>HOMBRE</span>
                <i class="fas fa-chevron-right toggle-icon"></i>
            </div>
            <div class="sidebar-submenu">
                <a href="${nivelProfundidad}pages/hombre/hombre.html"><strong>Ver Todo Hombre</strong></a>
                <a href="${nivelProfundidad}pages/remeras/remeras.html">Remeras</a>
                <a href="${nivelProfundidad}pages/buzos/buzos.html">Buzos</a>
                <a href="${nivelProfundidad}pages/camperas/camperas.html">Camperas</a>
                <a href="${nivelProfundidad}pages/pantalones/pantalones.html">Pantalones</a>
                <a href="${nivelProfundidad}pages/camisas/camisas.html">Camisas</a>
            </div>
        </div>

        <div class="sidebar-category" data-category="mujer">
            <div class="sidebar-category-header">
                <span>MUJER</span>
                <i class="fas fa-chevron-right toggle-icon"></i>
            </div>
            <div class="sidebar-submenu">
                <a href="${nivelProfundidad}pages/mujer/mujer.html"><strong>Ver Todo Mujer</strong></a>
                <a href="${nivelProfundidad}pages/Mremeras/Mremeras.html">Remeras/Tops</a>
                <a href="${nivelProfundidad}pages/Mvestidos/Mvestidos.html">Vestidos/Monos</a>
                <a href="${nivelProfundidad}pages/Mpolleras/Mpolleras.html">Polleras/Shorts/Skorts</a>
            </div>
        </div>

        <a href="${nivelProfundidad}pages/unisex/unisex.html" class="sidebar-main-link">UNISEX</a>
        <a href="${nivelProfundidad}pages/ingresos/ingresos.html" class="sidebar-main-link">INGRESOS</a>
        <a href="${nivelProfundidad}pages/descuentos/descuentos.html" class="sidebar-main-link">DESCUENTOS</a>

        <hr class="sidebar-divider">

        <div class="sidebar-auth-group">
            <a href="${nivelProfundidad}auth/login.html" class="sidebar-main-link">INICIAR SESIÓN</a>
            <a href="${nivelProfundidad}auth/registro.html" class="sidebar-main-link">REGISTRARSE</a>
        </div>
    </div>
</div>

<div class="overlay"></div>

<main class="public-main">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumbs">
            <li class="breadcrumb-item"><a href="${nivelProfundidad}home/home.html">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">${producto.genero.charAt(0).toUpperCase() + producto.genero.slice(1)}</a></li>
            <li class="breadcrumb-item"><a href="#">${producto.categoria}</a></li>
            <li class="breadcrumb-item active" aria-current="page">${producto.nombre}</li>
        </ol>
    </nav>

    <div class="producto-detalle-container">
        <div class="producto-galeria">
            <div class="imagen-principal">
                <img src="${producto.imagen_frente_url || nivelProfundidad + 'assets/images/placeholder.png'}" alt="${producto.nombre}">
            </div>
            <div class="miniaturas">
                <div class="miniatura activa">
                    <img src="${producto.imagen_frente_url || nivelProfundidad + 'assets/images/placeholder.png'}" alt="${producto.nombre} Vista 1">
                </div>
                <div class="miniatura">
                    <img src="${producto.imagen_espalda_url || producto.imagen_frente_url || nivelProfundidad + 'assets/images/placeholder.png'}" alt="${producto.nombre} Vista 2">
                </div>
            </div>
        </div>

        <div class="producto-info">
            <div class="producto-etiquetas">
                <!-- Se actualiza dinámicamente -->
            </div>

            <h1>${producto.nombre}</h1>
            
            <p class="producto-precio">
                <span>$${producto.precio.toLocaleString('es-AR')} ARS</span>
            </p>

            <div class="producto-talle">
                <h3>Talle: <span id="talle-actual">Selecciona un talle</span></h3>
                <div class="talle-opciones">
                    <button class="talle-btn" data-talle="XS">XS</button>
                    <button class="talle-btn" data-talle="S">S</button>
                    <button class="talle-btn" data-talle="M">M</button>
                    <button class="talle-btn" data-talle="L">L</button>
                    <button class="talle-btn" data-talle="XL">XL</button>
                    <button class="talle-btn" data-talle="XXL">XXL</button>
                </div>
            </div>

            <div class="producto-cantidad">
                <h3>Cantidad:</h3>
                <div class="cantidad-selector">
                    <button id="btn-menos" class="cantidad-btn">-</button>
                    <input type="number" id="cantidad-input" class="cantidad-input" value="1" min="1">
                    <button id="btn-mas" class="cantidad-btn">+</button>
                </div>
            </div>

            <div class="producto-acciones">
                <button class="btn-agregar-carrito">
                    <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                </button>
                <button class="btn-comprar-ahora">
                    <i class="fas fa-bolt"></i> Comprar Ahora
                </button>
            </div>
        </div>
    </div>

    <div class="producto-descripcion-completa">
        <div class="producto-descripcion">
            <h2>Descripción</h2>
            <p>${producto.descripcion || 'Producto de calidad premium.'}</p>
        </div>

        <div class="producto-especificaciones">
            <h2>Especificaciones</h2>
            <ul>
                ${producto.marca ? `<li><strong>Marca:</strong> ${producto.marca}</li>` : ''}
                ${producto.color ? `<li><strong>Color:</strong> ${producto.color}</li>` : ''}
                ${producto.talle ? `<li><strong>Talle disponible:</strong> ${producto.talle}</li>` : ''}
                ${producto.estado ? `<li><strong>Estado:</strong> ${producto.estado}</li>` : ''}
                <li><strong>Stock:</strong> ${producto.stock || 0} unidades</li>
            </ul>
        </div>
    </div>
</main>

<footer class="public-footer">
    <div class="footer-container">
        <div class="footer-column">
            <h4>Recirculate</h4>
            <p>Moda circular para un futuro sostenible.</p>
        </div>
        <div class="footer-column">
            <h4>Navegación</h4>
            <ul>
                <li><a href="${nivelProfundidad}home/home.html">Inicio</a></li>
                <li><a href="${nivelProfundidad}pages/remeras/remeras.html">Remeras</a></li>
                <li><a href="${nivelProfundidad}pages/pantalones/pantalones.html">Pantalones</a></li>
                <li><a href="${nivelProfundidad}pages/buzos/buzos.html">Buzos</a></li>
            </ul>
        </div>
        <div class="footer-column">
            <h4>Contacto</h4>
            <ul>
                <li><a href="mailto:info@recirculate.com">info@recirculate.com</a></li>
                <li><a href="tel:+5492615095558">+54 261 5095558</a></li>
                <li>Alpatacal 1434 - Quinta Sección</li>
            </ul>
        </div>
        <div class="footer-column">
            <h4>Síguenos</h4>
            <div class="social-icons">
                <a href="https://www.facebook.com/people/Recirculate-Mendoza/100083294088879/" target="_blank"><i class="fab fa-facebook-f"></i></a>
                <a href="https://www.instagram.com/recirculate_mdz" target="_blank"><i class="fab fa-instagram"></i></a>
                <a href="#"><i class="fab fa-twitter"></i></a>
            </div>
        </div>
    </div>
    
    <div class="footer-divider"></div>
    
    <div class="footer-bottom">
        <p>&copy; 2025 Recirculate. Todos los derechos reservados.</p>
    </div>
</footer>

<script src="${nivelProfundidad}assets/pages.js"></script>
<script src="${nivelProfundidad}assets/producto-detalle-dinamico.js"></script>
<script src="${nivelProfundidad}assets/producto-detalle.js"></script>
</body>
</html>`;
}

// POST /api/generar-pagina-producto - Genera la página HTML del producto
router.post('/', async (req, res) => {
    try {
        const producto = req.body;
        
        console.log('📄 Generando página para:', producto.nombre);
        
        if (!producto.nombre || !producto.genero || !producto.categoria) {
            return res.status(400).json({ 
                success: false,
                error: 'Faltan datos requeridos: nombre, genero, categoria' 
            });
        }

        // Generar slug del producto
        const slug = generarSlug(producto.nombre);
        
        // Determinar ruta de la carpeta
        const rutaCarpeta = determinarRuta(producto.genero, producto.categoria);
        
        // Ruta completa del archivo
        const directorioBase = path.join(__dirname, '../../RecirculateLoe/productos');
        const directorioProducto = path.join(directorioBase, rutaCarpeta);
        const archivoHTML = path.join(directorioProducto, `${slug}.html`);
        
        // Crear directorio si no existe
        await fs.mkdir(directorioProducto, { recursive: true });
        
        // Generar contenido HTML
        const contenidoHTML = generarHTMLProducto(producto);
        
        // Escribir archivo
        await fs.writeFile(archivoHTML, contenidoHTML, 'utf8');
        
        console.log(`✅ HTML creado: ${slug}.html`);
        
        res.json({ 
            success: true,
            message: 'Página HTML generada exitosamente',
            ruta: `/productos/${rutaCarpeta}/${slug}.html`,
            archivo: `${slug}.html`
        });
        
    } catch (error) {
        console.error('❌ Error generando HTML:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'Error al generar la página HTML',
            details: error.message 
        });
    }
});

module.exports = router;
