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
        <td data-label="Acciones">
          <button class="btn archivar" data-idx="${idx}" title ="Archivar venta">📁</button>
          <button class="btn editar" data-idx="${idx}" title ="Editar venta">✏️</button>
        </td>         
      `;
      tbody.appendChild(tr);
      total += Number(gasto.total) || 0;
  // Función global para borrar un gasto por índice
  window.borrarGasto = function(idx) {
    const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
    if (idx >= 0 && idx < gastos.length) {
      gastos.splice(idx, 1);
      localStorage.setItem('gastos', JSON.stringify(gastos));
      window.renderGastos();
    } else {
      console.warn('Índice de gasto fuera de rango');
    }
  };

  // Exponer renderGastos globalmente
window.renderGastos = renderGastos;


    });
    totalDiv.textContent = `Total gastado: ${formatearMoneda(total)}`;

    document.querySelectorAll('.archivar').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = e.target.dataset.idx;
        alert(`Gasto #${Number(idx)+1} archivada (aún no implementado).`);
      });
    });

    document.querySelectorAll('.editar').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = e.target.dataset.idx;
        alert(`Editar gasto #${Number(idx)+1} (llevar al formulario con datos precargados).`);
      });
    });
  }

  renderGastos();
  
  window.addEventListener('resize', () => {
    renderGastos();
  });
});
