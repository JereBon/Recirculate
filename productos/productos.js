// productos.js - CRUD de productos y control de stock
// Maneja formulario de productos, subida de imágenes, tabla de productos, edición y eliminación.

// Espera a que el DOM cargue completamente antes de ejecutar lógica
document.addEventListener('DOMContentLoaded', () => {
  // Elementos para subida de imágenes
  const imagenFileInput = document.getElementById('imagen-file');
  const imagenUploadStatus = document.getElementById('imagen-upload-status');
  let imagenesSubidas = []; // Array para almacenar URLs de imágenes subidas

  // Evento para subir imagen seleccionada a Cloudinary vía API
  imagenFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    imagenUploadStatus.textContent = 'Subiendo imagen...';
    const formData = new FormData();
    formData.append('imagen', file);
    try {
      const res = await fetch('https://recirculate-api.onrender.com/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        imagenesSubidas.push(data.url); // Agrega URL al array
        imagenUploadStatus.textContent = 'Imagen subida ✔';
      } else {
        imagenUploadStatus.textContent = 'Error al subir imagen';
      }
    } catch (err) {
      imagenUploadStatus.textContent = 'Error al subir imagen';
    }
  });
  // Elementos del formulario y tabla
  const form = document.getElementById('producto-form');
  const tabla = document.getElementById('tabla-productos').querySelector('tbody');
  const cancelarBtn = document.getElementById('cancelar-edicion');

  let editandoId = null; // ID del producto siendo editado, null si creando
  let productosCache = []; // Cache de productos para edición rápida
  const API_URL = 'https://recirculate-api.onrender.com/api/productos'; // URL base de la API


  // Función asíncrona para obtener productos desde la API y actualizar cache
  async function obtenerProductos() {
    const res = await fetch(API_URL);
    const data = await res.json();
    productosCache = data;
    return data;
  }

  // Función para resetear formulario, ocultar botón cancelar y limpiar errores
  function limpiarFormulario() {
    form.reset();
    editandoId = null;
    document.getElementById('producto-id').value = '';
    cancelarBtn.style.display = 'none';
    // Limpia mensajes de error en campos específicos
    ['e-nombre','e-precio','e-stock'].forEach(id => document.getElementById(id).textContent = '');
  }

  // Función para renderizar tabla de productos: obtiene datos, crea filas con nombre, precio, stock y botones editar/borrar
  async function renderTabla() {
    const productos = await obtenerProductos();
    tabla.innerHTML = '';
    if (productos.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="4" style="text-align:center; color:#888;">No hay productos cargados</td>';
      tabla.appendChild(tr);
      return;
    }
    // Detecta si es mobile para layout diferente
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    productos.forEach((prod, idx) => {
      const idVisual = idx + 1;
      if (isMobile) {
        // Agrega fila extra para mobile con número de producto
        const trProd = document.createElement('tr');
        trProd.className = 'producto-num-mobile';
        trProd.innerHTML = `<td colspan="4" class="producto-num-mobile-td">Producto #${idVisual}</td>`;
        tabla.appendChild(trProd);
      }
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="Nombre">${prod.nombre}</td>
        <td data-label="Precio">$${parseFloat(prod.precio).toFixed(2)}</td>
        <td data-label="Stock">${prod.stock}</td>
        <td data-label="Acciones">
          <button data-edit="${prod._id}" class="primary">Editar</button>
          <button data-borrar="${prod._id}" style="background:#e74c3c; color:#fff;">Borrar</button>
        </td>
      `;
      tabla.appendChild(tr);
    });
  }

  // Función para validar campos obligatorios del formulario: nombre, precio >=0, stock >=0
  function validarFormulario() {
    let valido = true;
    const nombre = form.nombre.value.trim();
    const precio = form.precio.value;
    const stock = form.stock.value;
    if (!nombre) {
      document.getElementById('e-nombre').textContent = 'El nombre es obligatorio';
      valido = false;
    } else {
      document.getElementById('e-nombre').textContent = '';
    }
    if (!precio || precio < 0) {
      document.getElementById('e-precio').textContent = 'Precio inválido';
      valido = false;
    } else {
      document.getElementById('e-precio').textContent = '';
    }
    if (!stock || stock < 0) {
      document.getElementById('e-stock').textContent = 'Stock inválido';
      valido = false;
    } else {
      document.getElementById('e-stock').textContent = '';
    }
    return valido;
  }

  // Evento submit del formulario: valida, crea objeto producto, envía POST o PUT según si edita o crea
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    let imagenes = imagenesSubidas.slice(); // Copia array de imágenes
    const nuevo = {
      nombre: form.nombre.value.trim(),
      descripcion: form.descripcion.value.trim(),
      categoria: form.categoria.value.trim(),
      talle: form.talle.value.trim(),
      color: form.color.value.trim(),
      marca: form.marca.value.trim(),
      estado: form.estado.value.trim(),
      precio: parseFloat(form.precio.value),
      moneda: form.moneda.value.trim() || 'ARS',
      imagenes,
      proveedor: {
        nombre: form['proveedor-nombre'].value.trim()
      },
      stock: parseInt(form.stock.value, 10),
      activo: form.activo.checked
    };
    if (editandoId !== null) {
      // Si editando, actualiza producto existente
      const res = await fetch(`${API_URL}/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo)
      });
      const data = await res.json();
      if (data.message) {
        alert(data.message); // Alerta si producto eliminado por stock
        limpiarFormulario();
        renderTabla();
        return;
      }
    } else {
      // Si no editando, crea nuevo producto
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo)
      });
    }
    limpiarFormulario();
    imagenesSubidas = []; // Resetea imágenes subidas
    renderTabla(); // Re-renderiza tabla
  });

  // Evento click en tabla: maneja botones editar y borrar
  tabla.addEventListener('click', async (e) => {
    if (e.target.dataset.edit !== undefined) {
      // Si click en editar, carga datos del producto en formulario
      const id = e.target.dataset.edit;
      const prod = productosCache.find(p => p._id === id);
      if (prod) {
        form.nombre.value = prod.nombre || '';
        form.descripcion.value = prod.descripcion || '';
        form.categoria.value = prod.categoria || '';
        form.talle.value = prod.talle || '';
        form.color.value = prod.color || '';
        form.marca.value = prod.marca || '';
        form.estado.value = prod.estado || '';
        form.precio.value = prod.precio || '';
        form.moneda.value = prod.moneda || 'ARS';
        imagenesSubidas = prod.imagenes ? prod.imagenes.slice() : [];
        imagenUploadStatus.textContent = imagenesSubidas.length ? 'Imagen cargada ✔' : '';
        form['proveedor-nombre'].value = prod.proveedor && prod.proveedor.nombre ? prod.proveedor.nombre : '';
        form.stock.value = prod.stock || '';
        form.activo.checked = prod.activo !== false;
        editandoId = id;
        cancelarBtn.style.display = ''; // Muestra botón cancelar
      }
    } else if (e.target.dataset.borrar !== undefined) {
      // Si click en borrar, confirma y elimina producto
      const id = e.target.dataset.borrar;
      if (confirm('¿Seguro que deseas borrar este producto?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        limpiarFormulario();
        renderTabla();
      }
    }
  });

  // Evento click en botón cancelar: resetea formulario
  cancelarBtn.addEventListener('click', limpiarFormulario);

  // Verifica parámetro 'id' en URL para editar producto específico (e.g., desde otra página)
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');
  if (editId) {
    fetch(`${API_URL}/${editId}`)
      .then(res => res.json())
      .then(prod => {
        if (prod) {
          // Carga datos del producto en formulario para edición
          form.nombre.value = prod.nombre || '';
          form.descripcion.value = prod.descripcion || '';
          form.categoria.value = prod.categoria || '';
          form.talle.value = prod.talle || '';
          form.color.value = prod.color || '';
          form.marca.value = prod.marca || '';
          form.estado.value = prod.estado || '';
          form.precio.value = prod.precio || '';
          form.moneda.value = prod.moneda || 'ARS';
          imagenesSubidas = prod.imagenes ? prod.imagenes.slice() : [];
          imagenUploadStatus.textContent = imagenesSubidas.length ? 'Imagen cargada ✔' : '';
          form['proveedor-nombre'].value = prod.proveedor && prod.proveedor.nombre ? prod.proveedor.nombre : '';
          form.stock.value = prod.stock || '';
          form.activo.checked = prod.activo !== false;
          editandoId = editId;
          cancelarBtn.style.display = '';
        }
      })
      .catch(err => console.error('Error al cargar producto para editar:', err));
  }

  // Renderiza tabla inicial al cargar página
  renderTabla();
  // Re-renderiza al cambiar tamaño de ventana (responsive)
  window.addEventListener('resize', renderTabla);
});
