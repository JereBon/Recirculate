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

  function renderGastos() {
    tbody.innerHTML = '';
    let total = 0;
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    gastos.forEach((gasto, idx) => {
      const tr = document.createElement('tr');
      const idVisual = idx + 1;
      if (isMobile) {
        // Fila extra para mobile: Gasto #
        const trGasto = document.createElement('tr');
        trGasto.className = 'gasto-num-mobile';
        trGasto.innerHTML = `<td colspan="6" class="gasto-num-mobile-td">Gasto #${idVisual}</td>`;
        tbody.appendChild(trGasto);
      }
      tr.innerHTML = `
        <td data-label="ID">${idVisual}</td>
        <td data-label="Fecha">${formatearFecha(gasto.fecha)}</td>
        <td data-label="Proveedor">${gasto.proveedor}</td>
        <td data-label="Concepto">${gasto.concepto}</td>
        <td data-label="Monto">${formatearMoneda(gasto.total)}</td>
        <td data-label="Método de pago">${gasto.metodoPago}</td>
      `;
      tbody.appendChild(tr);
      total += Number(gasto.total) || 0;
    });
    totalDiv.textContent = `Total gastado: ${formatearMoneda(total)}`;
  }

  renderGastos();
  window.addEventListener('resize', () => {
    renderGastos();
  });
});
