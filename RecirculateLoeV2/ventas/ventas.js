// ventas.js - Lógica para mostrar y gestionar el listado de ventas
// Este archivo se encarga de leer las ventas desde localStorage y mostrarlas en la tabla.
// También calcula el total de ventas y lo muestra en pantalla.

// Utilidad para leer datos de localStorage de forma segura
function leerDatos(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error al leer localStorage:", error);
    return [];
  }
}

// Función para formatear fecha a formato local legible
function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  const d = new Date(fechaISO);
  return d.toLocaleDateString('es-AR');
}

// Función para formatear monto a moneda
function formatearMoneda(valor) {
  return "$ " + Number(valor).toLocaleString('es-AR', {minimumFractionDigits: 2});
}

// Cargar y mostrar ventas al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const btnLimpiarFiltros = document.getElementById('limpiar-filtros');
  // Filtros
  const btnFiltros = document.getElementById('btn-filtros');
  const containerFiltros = document.querySelector('.container-filtros');
  const contFiltros = document.querySelector('.cont-filtros');
  const formFiltros = document.getElementById('form-filtros');
  const btnCerrarFiltros = document.getElementById('cerrar-filtros');
  let filtros = { cliente: '', fechaDesde: '', fechaHasta: '', metodo: '' };

  // Mostrar panel lateral al click en label Filtrar
  document.querySelector('.filter-btn .Filtrar').addEventListener('click', () => {
    containerFiltros.classList.add('show');
    setTimeout(() => {
      contFiltros.classList.add('slide');
    }, 10);
  });
  // Cerrar panel lateral
  btnCerrarFiltros.addEventListener('click', () => {
    contFiltros.classList.remove('slide');
    setTimeout(() => {
      containerFiltros.classList.remove('show');
    }, 300);
  });
  // Aplicar filtros
  formFiltros.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(formFiltros);
    filtros.cliente = fd.get('cliente').toLowerCase();
    filtros.fechaDesde = fd.get('fechaDesde');
    filtros.fechaHasta = fd.get('fechaHasta');
    filtros.metodo = fd.get('metodo').toLowerCase();
    filtrarVentas();
    contFiltros.classList.remove('slide');
    setTimeout(() => {
      containerFiltros.classList.remove('show');
    }, 300);
  });

  // Limpiar filtros y refrescar la tabla
  btnLimpiarFiltros.addEventListener('click', () => {
    filtros = { cliente: '', fechaDesde: '', fechaHasta: '', metodo: '' };
    formFiltros.reset();
    ventasOrdenadas = [...ventas];
    renderVentas();
    contFiltros.classList.remove('slide');
    setTimeout(() => {
      containerFiltros.classList.remove('show');
    }, 300);
  });

  function filtrarVentas() {
    ventasOrdenadas = ventas.filter(v => {
      let ok = true;
      if (filtros.cliente) ok = ok && v.cliente.toLowerCase().includes(filtros.cliente);
      if (filtros.fechaDesde) ok = ok && v.fecha >= filtros.fechaDesde;
      if (filtros.fechaHasta) ok = ok && v.fecha <= filtros.fechaHasta;
      if (filtros.metodo) ok = ok && v.metodoPago.toLowerCase().includes(filtros.metodo);
      return ok;
    });
    renderVentas();
  }
  let ventas = leerDatos('ventas');
  let ventasOrdenadas = [...ventas];
  // Ordenar
  const btnOrdenar = document.getElementById('btn-ordenar');
  const menuOrdenar = document.getElementById('menu-ordenar');
  btnOrdenar.addEventListener('click', () => {
    menuOrdenar.style.display = menuOrdenar.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', (e) => {
    if (!btnOrdenar.contains(e.target) && !menuOrdenar.contains(e.target)) {
      menuOrdenar.style.display = 'none';
    }
  });
  menuOrdenar.querySelectorAll('.ordenar-opcion').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tipo = btn.dataset.orden;
      if (tipo === 'monto') {
        ventasOrdenadas.sort((a, b) => Number(b.total) - Number(a.total));
      } else if (tipo === 'fecha') {
        ventasOrdenadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      } else if (tipo === 'metodo') {
        ventasOrdenadas.sort((a, b) => a.metodoPago.localeCompare(b.metodoPago));
      }
      renderVentas();
      menuOrdenar.style.display = 'none';
    });
  });
  const tbody = document.getElementById('ventas-body');
  const totalDiv = document.getElementById('ventas-total');

  function renderVentas() {
    tbody.innerHTML = '';
    let total = 0;
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    ventasOrdenadas.forEach((venta, idx) => {
      const tr = document.createElement('tr');
      const idVisual = idx + 1;
      if (isMobile) {
        // Fila extra para mobile: Venta #
        const trVenta = document.createElement('tr');
        trVenta.className = 'venta-num-mobile';
        trVenta.innerHTML = `<td colspan="7" class="venta-num-mobile-td">Venta #${idVisual}</td>`;
        tbody.appendChild(trVenta);
      }
      tr.innerHTML = `
        <td data-label="ID">${idVisual}</td>
        <td data-label="Fecha">${formatearFecha(venta.fecha)}</td>
        <td data-label="Cliente">${venta.cliente}</td>
        <td data-label="Producto">${venta.producto}</td>
        <td data-label="Cantidad">${venta.cantidad}</td>
        <td data-label="Total">${formatearMoneda(venta.total)}</td>
        <td data-label="Método de pago">${venta.metodoPago}</td>
        <td data-label="Acciones">
          <button class="btn archivar" data-idx="${idx}" title ="Archivar venta">📁</button>
          <button class="btn editar" data-idx="${idx}" title ="Editar venta">✏️</button>
        </td>  
      `;

        // Función global para borrar una venta por índice
  window.borrarVenta = function(idx) {
    const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
    if (idx >= 0 && idx < ventas.length) {
      ventas.splice(idx, 1);
      localStorage.setItem('ventas', JSON.stringify(ventas));
      window.renderVentas();
    } else {
      console.warn('Índice de venta fuera de rango');
    }
  };

  // Exponer renderVentas globalmente
  window.renderVentas = renderVentas;
  
      tbody.appendChild(tr);
      total += Number(venta.total) || 0;
    });
    totalDiv.textContent = `Total vendido: ${formatearMoneda(total)}`;

    document.querySelectorAll('.archivar').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = e.target.dataset.idx;
        alert(`Venta #${Number(idx)+1} archivada (aún no implementado).`);
      });
    });

    document.querySelectorAll('.editar').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = e.target.dataset.idx;
        alert(`Editar venta #${Number(idx)+1} (llevar al formulario con datos precargados).`);
      });
    });
  }

  renderVentas();

  // Volver a renderizar si cambia el tamaño de pantalla
  window.addEventListener('resize', () => {
    renderVentas();
  });
});
