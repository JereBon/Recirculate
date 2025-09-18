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
  const ventas = leerDatos('ventas');
  const tbody = document.getElementById('ventas-body');
  const totalDiv = document.getElementById('ventas-total');

  function renderVentas(filtro = "") {
    tbody.innerHTML = '';
    let total = 0;
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    ventas.forEach((venta, idx) => {
      // Filtrado por búsqueda
      if (filtro && !venta.cliente.toLowerCase().includes(filtro) && !venta.producto.toLowerCase().includes(filtro)) {
        return;
      }
      const tr = document.createElement('tr');
      const idVisual = idx + 1;
      if (isMobile) {
        const trVenta = document.createElement('tr');
        trVenta.className = 'venta-num-mobile';
        trVenta.innerHTML = `<td colspan="8" class="venta-num-mobile-td">Venta #${idVisual}</td>`;
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
          <div class="acciones-circulo">
            <button class="action-btn edit-btn" title="Editar" disabled>✏️</button>
            <button class="action-btn archive-btn" title="Archivar" disabled>🗄️</button>
            <button class="action-btn delete-btn" title="Borrar" data-idx="${idx}">🗑️</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
      total += Number(venta.total) || 0;
    });
    totalDiv.textContent = `Total vendido: ${formatearMoneda(total)}`;
    // Asignar eventos a los botones de borrar
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = btn.getAttribute('data-idx');
        if (confirm('¿Seguro que deseas borrar esta venta?')) {
          ventas.splice(idx, 1);
          localStorage.setItem('ventas', JSON.stringify(ventas));
          renderVentas(document.getElementById('search-input').value.trim().toLowerCase());
        }
      });
    });
  }

  // Búsqueda en vivo
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const filtro = searchInput.value.trim().toLowerCase();
      renderVentas(filtro);
    });
  }

  // Botón de filtro (solo visual)
  const filterBtn = document.getElementById('filter-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', () => {
      alert('Función de filtro próximamente');
    });
  }

  renderVentas();
  window.addEventListener('resize', () => {
    renderVentas(searchInput ? searchInput.value.trim().toLowerCase() : "");
  });
});
