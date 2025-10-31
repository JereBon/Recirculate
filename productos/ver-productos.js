<<<<<<< HEAD
// ver-productos.js - Muestra todos los productos y sus atributos, incluyendo imagen
// Carga productos desde API, renderiza tabla con todos los campos, maneja edición, eliminación y búsqueda.
=======
// ver-productos.js - Muestra todos los productos y sus atributos, incluyendo imagen y mejoras visuales
// Carga productos desde API, renderiza tabla con todos los campos, maneja edición, eliminación, búsqueda y filtros avanzados
>>>>>>> rama-axel

document.addEventListener('DOMContentLoaded', async () => {
  // Elementos del DOM
  const tabla = document.getElementById('tabla-todos-productos').querySelector('tbody');
  const searchInput = document.getElementById('search-input');
  const API_URL = "https://recirculate-api.onrender.com/api/productos";
  const errorDiv = document.getElementById("errorProductos");

  let allProductos = []; // Cache de todos los productos
<<<<<<< HEAD
  let searchTerm = ''; // Término de búsqueda actual
  let filtros = { nombre: '', categoria: '', marca: '', precioDesde: '', precioHasta: '', stockDesde: '', stockHasta: '', fechaDesde: '', fechaHasta: '' };
=======
  let searchTerm = '';
  let filtros = { nombre: '', categoria: '', marca: '', genero: '', precioDesde: '', precioHasta: '', stockDesde: '', stockHasta: '', fechaDesde: '', fechaHasta: '' };
>>>>>>> rama-axel

  // Función asíncrona para obtener productos desde la API
  async function fetchProductos() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("No se pudieron cargar los productos");
      const productos = await res.json();
      return productos;
    } catch (err) {
      console.error('Error al cargar productos:', err);
      errorDiv.textContent = err.message;
      return [];
    }
  }

  // Función para filtrar productos según término de búsqueda y filtros aplicados
  function filtrarProductos(productos) {
    let filtered = productos;
<<<<<<< HEAD

=======
>>>>>>> rama-axel
    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(prod =>
        (prod.nombre && prod.nombre.toLowerCase().includes(term)) ||
        (prod.categoria && prod.categoria.toLowerCase().includes(term)) ||
        (prod.marca && prod.marca.toLowerCase().includes(term)) ||
        (prod.descripcion && prod.descripcion.toLowerCase().includes(term)) ||
        (prod.id && prod.id.toString().toLowerCase().includes(term))
      );
    }
<<<<<<< HEAD

=======
>>>>>>> rama-axel
    // Filtros específicos
    if (filtros.nombre) {
      filtered = filtered.filter(p => p.nombre && p.nombre.toLowerCase().includes(filtros.nombre.toLowerCase()));
    }
    if (filtros.categoria) {
      filtered = filtered.filter(p => p.categoria && p.categoria.toLowerCase().includes(filtros.categoria.toLowerCase()));
    }
    if (filtros.marca) {
      filtered = filtered.filter(p => p.marca && p.marca.toLowerCase().includes(filtros.marca.toLowerCase()));
    }
<<<<<<< HEAD
    // Proveedor no existe en PostgreSQL - removido
=======
    // Filtro por género
    if (filtros.genero) {
      const generoFiltro = filtros.genero.toLowerCase();
      filtered = filtered.filter(p => p.genero && p.genero.toLowerCase() === generoFiltro);
    }
>>>>>>> rama-axel
    if (filtros.precioDesde) {
      filtered = filtered.filter(p => p.precio != null && p.precio >= parseFloat(filtros.precioDesde));
    }
    if (filtros.precioHasta) {
      filtered = filtered.filter(p => p.precio != null && p.precio <= parseFloat(filtros.precioHasta));
    }
    if (filtros.stockDesde) {
      filtered = filtered.filter(p => p.stock != null && p.stock >= parseInt(filtros.stockDesde));
    }
    if (filtros.stockHasta) {
      filtered = filtered.filter(p => p.stock != null && p.stock <= parseInt(filtros.stockHasta));
    }
    if (filtros.fechaDesde) {
      filtered = filtered.filter(p => p.fecha_creacion && new Date(p.fecha_creacion) >= new Date(filtros.fechaDesde));
    }
    if (filtros.fechaHasta) {
      filtered = filtered.filter(p => p.fecha_creacion && new Date(p.fecha_creacion) <= new Date(filtros.fechaHasta));
    }
<<<<<<< HEAD
    // Campo activo no existe en PostgreSQL - removido

=======
>>>>>>> rama-axel
    return filtered;
  }

  // Función asíncrona para cargar y renderizar productos desde API
  async function cargarProductos() {
    tabla.innerHTML = '';
    errorDiv.textContent = "";
    if (allProductos.length === 0) {
      allProductos = await fetchProductos(); // Carga inicial
    }
    const productosFiltrados = filtrarProductos(allProductos);
    tabla.innerHTML = '';
    if (!productosFiltrados.length) {
<<<<<<< HEAD
      // Mensaje si no hay productos o ninguno coincide con búsqueda
      const colspan = searchTerm.trim() ? 16 : 16;
=======
      const colspan = 18; // Incluye columna de género y mejoras visuales
>>>>>>> rama-axel
      tabla.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center; color:#888;">${searchTerm.trim() ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos cargados'}</td></tr>`;
      return;
    }
    // Detecta si es mobile para layout diferente
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
<<<<<<< HEAD
    // Crea fila por cada producto con todos los atributos
    productosFiltrados.forEach((prod, idx) => {
      const idVisual = idx + 1;
      if (isMobile) {
        // Agrega fila extra para mobile con número de producto
        const trProd = document.createElement('tr');
        trProd.className = 'producto-num-mobile';
        trProd.innerHTML = `<td colspan="16" class="producto-num-mobile-td">Producto #${idVisual}</td>`;
        tabla.appendChild(trProd);
      }
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="Imagen">
          ${prod.imagen_url ? `<img src="${prod.imagen_url}" class="producto-img" alt="Imagen producto" />` : ''}
        </td>
=======
    // Crea fila por cada producto con todos los atributos y mejoras visuales
    productosFiltrados.forEach((prod, idx) => {
      const idVisual = idx + 1;
      if (isMobile) {
        const trProd = document.createElement('tr');
        trProd.className = 'producto-num-mobile';
        trProd.innerHTML = `<td colspan="18" class="producto-num-mobile-td">Producto #${idVisual}</td>`;
        tabla.appendChild(trProd);
      }
      const tr = document.createElement('tr');
      // --- IMAGEN CON HOVER ---
      let imagenHtml = '';
      if (prod.imagen_url) {
        const hoverImg = prod.imagen_hover || prod.imagen_espalda_url;
        if (hoverImg) {
          imagenHtml = `<img src="${prod.imagen_url}" class="producto-img" alt="Imagen producto" onmouseover="this.src='${hoverImg}'" onmouseout="this.src='${prod.imagen_url}'" />`;
        } else {
          imagenHtml = `<img src="${prod.imagen_url}" class="producto-img" alt="Imagen producto" />`;
        }
      }
      // --- Mejoras visuales: data-label en celdas, badge de género ---
      tr.innerHTML = `
        <td data-label="Imagen">${imagenHtml}</td>
>>>>>>> rama-axel
        <td data-label="Nombre">${prod.nombre || ''}</td>
        <td data-label="Descripción">${prod.descripcion || ''}</td>
        <td data-label="Categoría">${prod.categoria || ''}</td>
        <td data-label="Talle">${prod.talle || ''}</td>
        <td data-label="Color">${prod.color || ''}</td>
<<<<<<< HEAD
        <td data-label="Marca">${prod.marca || ''}</td>
        <td data-label="Estado">${prod.estado || ''}</td>
        <td data-label="Precio">${prod.precio != null ? '$' + prod.precio : ''}</td>
        <td data-label="Moneda">ARS</td>
        <td data-label="Proveedor">${prod.proveedor || '-'}</td>
        <td data-label="Stock">${prod.stock != null ? prod.stock : ''}</td>
=======
        <td data-label="Género"><span style="background:${getGeneroColor(prod.genero)};padding:4px 8px;border-radius:12px;font-size:0.9em;font-weight:bold;">${prod.genero || '-'}</span></td>
        <td data-label="Marca">${prod.marca || ''}</td>
        <td data-label="Estado">${prod.estado || ''}</td>
        <td data-label="Precio">${prod.precio != null ? '$' + prod.precio : ''}</td>
        <td data-label="Descuento">${prod.descuento ? prod.descuento + '%' : '0%'}</td>
        <td data-label="Moneda">ARS</td>
        <td data-label="Proveedor">${prod.proveedor || '-'} </td>
        <td data-label="Stock">${prod.stock != null ? prod.stock : ''}</td>
        <td data-label="Destacado">
          <label class="toggle-switch">
            <input type="checkbox" ${prod.destacado ? 'checked' : ''} data-toggle-destacado="${prod.id}">
            <span class="toggle-slider"></span>
          </label>
        </td>
>>>>>>> rama-axel
        <td data-label="Activo">Sí</td>
        <td data-label="Creado">${prod.fecha_creacion ? new Date(prod.fecha_creacion).toLocaleString() : ''}</td>
        <td data-label="Actualizado">${prod.fecha_actualizacion ? new Date(prod.fecha_actualizacion).toLocaleString() : ''}</td>
        <td data-label="Acciones">
          <button data-edit="${prod.id}" class="primary">Editar</button>
          <button data-delete="${prod.id}" style="background:#e74c3c; color:#fff; margin-left:8px;">Eliminar</button>
        </td>
      `;
      tabla.appendChild(tr);
    });
  }

  // Evento click en tabla para manejar botones de editar y eliminar
  tabla.addEventListener('click', async (e) => {
    if (e.target.dataset.edit !== undefined) {
<<<<<<< HEAD
      // Redirige a página de edición con ID del producto
      const id = e.target.dataset.edit;
      window.location.href = `productos.html?id=${id}`;
    } else if (e.target.dataset.delete !== undefined) {
      // Confirma y elimina producto, luego recarga tabla
      const id = e.target.dataset.delete;
      if (confirm('¿Seguro que deseas eliminar este producto?')) {
        try {
          await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
          allProductos = allProductos.filter(p => p.id !== id); // Actualiza cache
          cargarProductos(); // Refresca tabla
=======
      const id = e.target.dataset.edit;
      window.location.href = `registrar-producto.html?id=${id}`;
    } else if (e.target.dataset.delete !== undefined) {
      const id = e.target.dataset.delete;
      if (confirm('¿Seguro que deseas eliminar este producto?')) {
        try {
          const token = localStorage.getItem('authToken');
          const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!res.ok) {
            const data = await res.json();
            alert('Error al eliminar producto: ' + (data.message || res.status));
            return;
          }
          allProductos = allProductos.filter(p => p.id !== id);
          cargarProductos();
>>>>>>> rama-axel
        } catch (err) {
          alert('Error al eliminar producto');
        }
      }
    }
  });

  // Evento para búsqueda en tiempo real
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
<<<<<<< HEAD
    cargarProductos(); // Re-renderiza con filtro
=======
    cargarProductos();
>>>>>>> rama-axel
  });

  // Manejo del botón filtrar para mostrar panel lateral
  const btnFiltrar = document.getElementById('btn-filtrar');
  const containerFiltros = document.querySelector('.container-filtros');
  const contFiltros = document.querySelector('.cont-filtros');
  const btnCerrarFiltros = document.getElementById('cerrar-filtros');
  const formFiltros = document.getElementById('form-filtros');
  const btnLimpiarFiltros = document.getElementById('limpiar-filtros');

  btnFiltrar.addEventListener('click', () => {
    containerFiltros.classList.add('show');
    setTimeout(() => contFiltros.classList.add('slide'), 10);
  });

  btnCerrarFiltros.addEventListener('click', () => {
    contFiltros.classList.remove('slide');
    setTimeout(() => containerFiltros.classList.remove('show'), 300);
  });

  containerFiltros.addEventListener('click', (e) => {
    if (e.target === containerFiltros) {
      contFiltros.classList.remove('slide');
      setTimeout(() => containerFiltros.classList.remove('show'), 300);
    }
  });

  formFiltros.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(formFiltros);
    filtros.nombre = (fd.get('nombre') || '').trim();
    filtros.categoria = (fd.get('categoria') || '').trim();
    filtros.marca = (fd.get('marca') || '').trim();
<<<<<<< HEAD
=======
    filtros.genero = (fd.get('genero') || '').trim();
>>>>>>> rama-axel
    filtros.proveedor = (fd.get('proveedor') || '').trim();
    filtros.precioDesde = fd.get('precioDesde') || '';
    filtros.precioHasta = fd.get('precioHasta') || '';
    filtros.stockDesde = fd.get('stockDesde') || '';
    filtros.stockHasta = fd.get('stockHasta') || '';
    filtros.fechaDesde = fd.get('fechaDesde') || '';
    filtros.fechaHasta = fd.get('fechaHasta') || '';
<<<<<<< HEAD
    filtros.activo = fd.get('activo') !== null;
=======
>>>>>>> rama-axel
    contFiltros.classList.remove('slide');
    setTimeout(() => containerFiltros.classList.remove('show'), 300);
    cargarProductos();
  });

  btnLimpiarFiltros.addEventListener('click', () => {
<<<<<<< HEAD
    filtros = { nombre: '', categoria: '', marca: '', precioDesde: '', precioHasta: '', stockDesde: '', stockHasta: '', fechaDesde: '', fechaHasta: '' };
=======
    filtros = { nombre: '', categoria: '', marca: '', genero: '', precioDesde: '', precioHasta: '', stockDesde: '', stockHasta: '', fechaDesde: '', fechaHasta: '' };
>>>>>>> rama-axel
    formFiltros.reset();
    cargarProductos();
  });

  // --- BOTÓN PARA AGREGAR PRODUCTOS ---
  const btnAgregarProducto = document.getElementById('btn-agregar-producto');
<<<<<<< HEAD

  // Redirigir a página de productos (formulario original)
  if (btnAgregarProducto) {
    btnAgregarProducto.addEventListener('click', () => {
      window.location.href = 'productos.html';
    });
  }

=======
  if (btnAgregarProducto) {
    btnAgregarProducto.addEventListener('click', () => {
      window.location.href = 'registrar-producto.html';
    });
  }

  // --- MANEJAR TOGGLE DE DESTACADO ---
  document.addEventListener('change', async (e) => {
    if (e.target.dataset.toggleDestacado) {
      const productoId = e.target.dataset.toggleDestacado;
      const destacado = e.target.checked;
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/${productoId}/destacado`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ destacado })
        });
        if (!response.ok) {
          throw new Error('Error al cambiar estado destacado');
        }
        console.log(`Producto ${productoId} ${destacado ? 'marcado' : 'desmarcado'} como destacado`);
      } catch (error) {
        console.error('Error:', error);
        e.target.checked = !destacado;
        alert('Error al cambiar el estado destacado del producto');
      }
    }
  });

>>>>>>> rama-axel
  // Carga inicial de productos
  cargarProductos();
  // Re-renderiza al cambiar tamaño de ventana (responsive)
  window.addEventListener('resize', cargarProductos);
});
<<<<<<< HEAD
=======

// Función para obtener color según género
function getGeneroColor(genero) {
  switch(genero) {
    case 'Hombre': return '#87CEEB'; // Azul claro
    case 'Mujer': return '#FFB6C1'; // Rosa claro
    case 'Unisex': return '#98FB98'; // Verde claro
    default: return '#F0F0F0'; // Gris claro
  }
}
>>>>>>> rama-axel
