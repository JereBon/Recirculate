// producto-detalle.js
// Renderiza la vista de detalle de producto dinámicamente

// Utilidad para obtener el parámetro id de la URL
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Renderiza los datos del producto en el HTML
function renderProductDetail(product, isAdmin) {
  const container = document.getElementById('producto-detalle-container');
  if (!product) {
    container.innerHTML = '<p>Producto no encontrado.</p>';
    return;
  }
  container.innerHTML = `
    <div class="producto-detalle">
      <h2>${product.nombre}</h2>
      <div class="imagenes-producto">
        <img src="${product.imagen_url}" alt="Imagen principal" class="main-img">
        <img src="${product.imagen_hover || product.imagen_espalda_url || ''}" alt="Imagen secundaria" class="hover-img">
      </div>
      <div class="descripcion-producto">
        <h3>Descripción
          ${isAdmin ? '<span class="edit-icon" title="Editar descripción">✏️</span>' : ''}
        </h3>
        <p>${product.descripcion || 'Sin descripción'}</p>
      </div>
      <div class="especificaciones-producto">
        <h3>Especificaciones
          ${isAdmin ? '<span class="edit-icon" title="Editar especificaciones">✏️</span>' : ''}
        </h3>
        <ul>
          <li><strong>Categoría:</strong> ${product.categoria}</li>
          <li><strong>Género:</strong> ${product.genero}</li>
          <li><strong>Talle:</strong> ${product.talle}</li>
          <li><strong>Color:</strong> ${product.color}</li>
          <li><strong>Marca:</strong> ${product.marca}</li>
          <li><strong>Precio:</strong> $${product.precio}</li>
          <li><strong>Stock:</strong> ${product.stock}</li>
          <li><strong>Descuento:</strong> ${product.descuento}%</li>
        </ul>
      </div>
    </div>
  `;
}

// Simulación de autenticación admin (reemplazar por lógica real)
function isAdminUser() {
  // Aquí deberías usar tu lógica real de autenticación
  return window.isAdmin === true;
}

// Obtiene los datos del producto desde el backend
async function fetchProductData(id) {
  try {
    const res = await fetch(`/api/productos/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

// Inicializa la vista
(async function init() {
  const id = getProductIdFromUrl();
  if (!id) {
    renderProductDetail(null, false);
    return;
  }
  const product = await fetchProductData(id);
  renderProductDetail(product, isAdminUser());
})();
