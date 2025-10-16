// ver-productos.js - Muestra todos los productos y sus atributos, incluyendo imagen
// Carga productos desde API, renderiza tabla con todos los campos, maneja edición, eliminación y búsqueda.

document.addEventListener('DOMContentLoaded', async () => {
  // Elementos del DOM
  const tabla = document.getElementById('tabla-todos-productos').querySelector('tbody');
  const searchInput = document.getElementById('search-input');
  const API_URL = "https://recirculate-api.onrender.com/api/productos";
  const errorDiv = document.getElementById("errorProductos");

  let allProductos = []; // Cache de todos los productos
  let searchTerm = ''; // Término de búsqueda actual
  let filtros = { nombre: '', categoria: '', marca: '', precioDesde: '', precioHasta: '', stockDesde: '', stockHasta: '', fechaDesde: '', fechaHasta: '' };

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
    // Proveedor no existe en PostgreSQL - removido
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
    // Campo activo no existe en PostgreSQL - removido

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
      // Mensaje si no hay productos o ninguno coincide con búsqueda
      const colspan = searchTerm.trim() ? 16 : 16;
      tabla.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center; color:#888;">${searchTerm.trim() ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos cargados'}</td></tr>`;
      return;
    }
    // Detecta si es mobile para layout diferente
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
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
        <td data-label="Nombre">${prod.nombre || ''}</td>
        <td data-label="Descripción">${prod.descripcion || ''}</td>
        <td data-label="Categoría">${prod.categoria || ''}</td>
        <td data-label="Talle">${prod.talle || ''}</td>
        <td data-label="Color">${prod.color || ''}</td>
        <td data-label="Marca">${prod.marca || ''}</td>
        <td data-label="Estado">${prod.estado || ''}</td>
        <td data-label="Precio">${prod.precio != null ? '$' + prod.precio : ''}</td>
        <td data-label="Moneda">ARS</td>
        <td data-label="Proveedor">${prod.proveedor || '-'}</td>
        <td data-label="Stock">${prod.stock != null ? prod.stock : ''}</td>
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
        } catch (err) {
          alert('Error al eliminar producto');
        }
      }
    }
  });

  // Evento para búsqueda en tiempo real
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    cargarProductos(); // Re-renderiza con filtro
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
    filtros.proveedor = (fd.get('proveedor') || '').trim();
    filtros.precioDesde = fd.get('precioDesde') || '';
    filtros.precioHasta = fd.get('precioHasta') || '';
    filtros.stockDesde = fd.get('stockDesde') || '';
    filtros.stockHasta = fd.get('stockHasta') || '';
    filtros.fechaDesde = fd.get('fechaDesde') || '';
    filtros.fechaHasta = fd.get('fechaHasta') || '';
    filtros.activo = fd.get('activo') !== null;
    contFiltros.classList.remove('slide');
    setTimeout(() => containerFiltros.classList.remove('show'), 300);
    cargarProductos();
  });

  btnLimpiarFiltros.addEventListener('click', () => {
    filtros = { nombre: '', categoria: '', marca: '', precioDesde: '', precioHasta: '', stockDesde: '', stockHasta: '', fechaDesde: '', fechaHasta: '' };
    formFiltros.reset();
    cargarProductos();
  });

  // --- BOTÓN PARA AGREGAR PRODUCTOS ---
  const btnAgregarProducto = document.getElementById('btn-agregar-producto');

  // Redirigir a página de productos (formulario original)
  if (btnAgregarProducto) {
    btnAgregarProducto.addEventListener('click', () => {
      window.location.href = 'productos.html';
    });
  }

  // Carga inicial de productos
  cargarProductos();
  // Re-renderiza al cambiar tamaño de ventana (responsive)
  window.addEventListener('resize', cargarProductos);
});
