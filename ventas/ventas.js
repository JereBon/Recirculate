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

  function renderVentas() {
    tbody.innerHTML = '';
    let total = 0;
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    ventas.forEach((venta, idx) => {
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
      `;
      tbody.appendChild(tr);
      total += Number(venta.total) || 0;
    });
    totalDiv.textContent = `Total vendido: ${formatearMoneda(total)}`;
  }

  renderVentas();

  // Volver a renderizar si cambia el tamaño de pantalla
  window.addEventListener('resize', () => {
    renderVentas();
  });
});
