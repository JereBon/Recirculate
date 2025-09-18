// gastos.js - Lógica para mostrar y gestionar el listado de gastos
// Este archivo se encarga de leer los gastos desde localStorage y mostrarlos en la tabla.
// También calcula el total de gastos y lo muestra en pantalla.

function leerDatos(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error al leer localStorage:", error);
    return [];
  }
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  const d = new Date(fechaISO);
  return d.toLocaleDateString('es-AR');
}

function formatearMoneda(valor) {
  return "$ " + Number(valor).toLocaleString('es-AR', {minimumFractionDigits: 2});
}

document.addEventListener('DOMContentLoaded', () => {
  const gastos = leerDatos('gastos');
  const tbody = document.getElementById('gastos-body');
  const totalDiv = document.getElementById('gastos-total');

  function renderGastos(filtro = "") {
    tbody.innerHTML = '';
    let total = 0;
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    gastos.forEach((gasto, idx) => {
      // Filtrado por búsqueda
      if (filtro && !gasto.proveedor.toLowerCase().includes(filtro) && !gasto.concepto.toLowerCase().includes(filtro)) {
        return;
      }
      const tr = document.createElement('tr');
      const idVisual = idx + 1;
      if (isMobile) {
        const trGasto = document.createElement('tr');
        trGasto.className = 'gasto-num-mobile';
        trGasto.innerHTML = `<td colspan="7" class="gasto-num-mobile-td">Gasto #${idVisual}</td>`;
        tbody.appendChild(trGasto);
      }
      tr.innerHTML = `
        <td data-label="ID">${idVisual}</td>
        <td data-label="Fecha">${formatearFecha(gasto.fecha)}</td>
        <td data-label="Proveedor">${gasto.proveedor}</td>
        <td data-label="Concepto">${gasto.concepto}</td>
        <td data-label="Monto">${formatearMoneda(gasto.total)}</td>
        <td data-label="Método de pago">${gasto.metodoPago}</td>
        <td data-label="Acciones">
          <div class="acciones-circulo">
            <button class="action-btn edit-btn" title="Editar" disabled>✏️</button>
            <button class="action-btn archive-btn" title="Archivar" disabled>🗄️</button>
            <button class="action-btn delete-btn" title="Borrar" data-idx="${idx}">🗑️</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
      total += Number(gasto.total) || 0;
    });
    totalDiv.textContent = `Total gastado: ${formatearMoneda(total)}`;
    // Asignar eventos a los botones de borrar
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = btn.getAttribute('data-idx');
        if (confirm('¿Seguro que deseas borrar este gasto?')) {
          gastos.splice(idx, 1);
          localStorage.setItem('gastos', JSON.stringify(gastos));
          renderGastos(document.getElementById('search-input').value.trim().toLowerCase());
        }
      });
    });
  }

  // Búsqueda en vivo
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const filtro = searchInput.value.trim().toLowerCase();
      renderGastos(filtro);
    });
  }

  // Botón de filtro (solo visual)
  const filterBtn = document.getElementById('filter-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', () => {
      alert('Función de filtro próximamente');
    });
  }

  renderGastos();
  window.addEventListener('resize', () => {
    renderGastos(searchInput ? searchInput.value.trim().toLowerCase() : "");
  });
});
