<<<<<<< HEAD
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
=======
document.addEventListener('DOMContentLoaded', async () => {

const API_BASE_URL = 'https://recirculate-api.onrender.com/api';

// Función para cargar ventas desde la API
async function cargarVentas() {
  try {
    const response = await fetch(`${API_BASE_URL}/ventas`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al cargar ventas:', error);
>>>>>>> rama-axel
    return [];
  }
}

<<<<<<< HEAD
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
=======
function formatearFecha(iso) { 
  return iso ? new Date(iso).toLocaleDateString('es-AR') : ''; 
}

function formatearMoneda(v) { 
  const n = Number(v); 
  return "$ " + (isNaN(n) ? 0 : n).toLocaleString('es-AR', {minimumFractionDigits: 2}); 
}

let filtros = { cliente: '', producto: '', fechaDesde: '', fechaHasta: '', metodo: '' };
let ventas = [];
let ventasOrdenadas = [];
const SEQ_KEY = 'ventas_seq_map';
let sortState = { campo: null, asc: null };

const tbody = document.getElementById('ventas-body');
const totalDiv = document.getElementById('ventas-total');
const inputBuscar = document.getElementById('q');
const btnOrdenar = document.getElementById('btn-ordenar');
const menuOrdenar = document.getElementById('menu-ordenar');
const btnFiltrar = document.getElementById('btn-filtrar');
const containerFiltros = document.querySelector('.container-filtros');
const contFiltros = document.querySelector('.cont-filtros');
const btnCerrarFiltros = document.getElementById('cerrar-filtros');
const formFiltros = document.getElementById('form-filtros');

function formatSeqNum(n) { return '#' + String(n).padStart(4, '0'); }

function pasaFiltros(v) {
  if (filtros.cliente && !(v.cliente || '').toLowerCase().includes(filtros.cliente)) return false;
  if (filtros.producto && !(v.producto || '').toLowerCase().includes(filtros.producto)) return false;
  if (filtros.fechaDesde && new Date(v.fecha_creacion || v.fecha) < new Date(filtros.fechaDesde)) return false;
  if (filtros.fechaHasta && new Date(v.fecha_creacion || v.fecha) > new Date(filtros.fechaHasta)) return false;
  if (filtros.metodo && !(v.metodoPago || '').toLowerCase().includes(filtros.metodo)) return false;
  return true;
}

function updateOrdenButton() {
  const labels = { monto: 'monto', fecha: 'fecha', metodo: 'método', cliente: 'cliente' };
  if (!sortState.campo) {
    btnOrdenar.textContent = '⇅ Ordenar';
    return;
  }
  const dir = sortState.asc ? '↑' : '↓';
  const label = labels[sortState.campo] || sortState.campo;
  btnOrdenar.textContent = `⇅ Ordenar (${label} ${dir})`;
}

function asignarSecuenciales(ventas) {
  let seqMap = {};
  try { seqMap = JSON.parse(localStorage.getItem(SEQ_KEY)) || {}; } catch(e) { seqMap = {}; }
  let usedNums = Object.values(seqMap).map(n => Number(n)).filter(n => !isNaN(n));
  let nextNum = usedNums.length ? Math.max(...usedNums) + 1 : 1;
  ventas.forEach(v => {
    const pid = v.id || v._generatedId;
    if (!seqMap[pid]) {
      seqMap[pid] = nextNum++;
    }
  });
  try { localStorage.setItem(SEQ_KEY, JSON.stringify(seqMap)); } catch(e){}
  return seqMap;
}

function renderVentas() {
  tbody.innerHTML = '';
  let total = 0;
  const isMobile = window.matchMedia('(max-width: 600px)').matches;
  ventasOrdenadas.forEach((venta, i) => {
    if (!pasaFiltros(venta)) return;
    const idx = i + 1;
    const val = Number(venta.total) || 0;
    const persistentId = venta.id || venta._generatedId || idx;
    const seqMap = JSON.parse(localStorage.getItem(SEQ_KEY)||'{}');
    const seqNum = seqMap[persistentId];
    const displayId = seqNum ? formatSeqNum(seqNum) : persistentId;

    if (isMobile) {
      const trNum = document.createElement('tr');
      trNum.className = 'venta-num-mobile';
      trNum.innerHTML = `<td colspan="8" class="venta-num-mobile-td">Venta #${idx}</td>`;
      tbody.appendChild(trNum);
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="ID">${displayId}</td>
      <td data-label="Fecha">${formatearFecha(venta.fecha_creacion || venta.fecha)}</td>
      <td data-label="Cliente">${venta.cliente || ''}</td>
      <td data-label="Producto">${venta.producto || ''}</td>
      <td data-label="Cantidad">${venta.cantidad || 0}</td>
      <td data-label="Total">${formatearMoneda(val)}</td>
      <td data-label="Método de pago">${venta.metodoPago || ''}</td>
      <td data-label="Acciones">
        <button class="btn archivar" data-id="${persistentId}" title="Archivar venta">📁</button>
        <button class="btn editar" data-id="${persistentId}" title="Editar venta">✏️</button>
      </td>
    `;
    tbody.appendChild(tr);
    total += val;
  });
  totalDiv.textContent = `Total ventas: ${formatearMoneda(total)}`;

  // Eventos para botones de acción
  document.querySelectorAll('.archivar').forEach(b => b.onclick = async e => {
    const id = e.currentTarget.dataset.id;
    if (confirm('¿Seguro que deseas archivar esta venta?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/ventas/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al archivar');
        ventas = await cargarVentas();
        ventasOrdenadas = [...ventas];
        asignarSecuenciales(ventas);
        renderVentas();
      } catch (err) {
        alert(err.message);
      }
    }
  });

  document.querySelectorAll('.editar').forEach(b => b.onclick = e => {
    const id = e.currentTarget.dataset.id;
    alert(`Editar venta ID: ${id} (funcionalidad por implementar)`);
  });
}

// Búsqueda
inputBuscar.addEventListener('input', () => {
  const q = inputBuscar.value.trim().toLowerCase();
  ventasOrdenadas = ventas.filter(v =>
    !q || [v.cliente, v.producto, v.metodoPago].some(x => (x || '').toLowerCase().includes(q))
  );
  renderVentas();
});

// Ordenamiento
btnOrdenar.addEventListener('click', () => {
  menuOrdenar.style.display = menuOrdenar.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', (e) => {
  if (!btnOrdenar.contains(e.target) && !menuOrdenar.contains(e.target)) {
    menuOrdenar.style.display = 'none';
  }
});

menuOrdenar.querySelectorAll('.ordenar-opcion').forEach(btn => {
  btn.addEventListener('click', () => {
    const tipo = btn.dataset.orden;
    if (sortState.campo === tipo) {
      sortState.asc = !sortState.asc;
    } else {
      sortState.campo = tipo;
      if (tipo === 'monto' || tipo === 'fecha') sortState.asc = false;
      else sortState.asc = true;
    }
    const asc = sortState.asc ? 1 : -1;
    if (tipo === 'monto') {
      ventasOrdenadas.sort((a, b) => asc * ((Number(a.total) || 0) - (Number(b.total) || 0)));
    } else if (tipo === 'fecha') {
      ventasOrdenadas.sort((a, b) => asc * ((new Date(a.fecha_creacion || a.fecha)).getTime() - (new Date(b.fecha_creacion || b.fecha)).getTime()));
    } else if (tipo === 'metodo') {
      ventasOrdenadas.sort((a, b) => asc * ((a.metodoPago || '').localeCompare(b.metodoPago || '')));
    } else if (tipo === 'cliente') {
      ventasOrdenadas.sort((a, b) => asc * ((a.cliente || '').localeCompare(b.cliente || '')));
    }
    menuOrdenar.style.display = 'none';
    updateOrdenButton();
    renderVentas();
  });
});
updateOrdenButton();

// Filtros
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
  filtros.cliente = (fd.get('cliente') || '').toLowerCase();
  filtros.producto = (fd.get('producto') || '').toLowerCase();
  filtros.fechaDesde = (fd.get('fechaDesde') || '');
  filtros.fechaHasta = (fd.get('fechaHasta') || '');
  filtros.metodo = (fd.get('metodo') || '').toLowerCase();
  contFiltros.classList.remove('slide');
  setTimeout(() => containerFiltros.classList.remove('show'), 300);
  renderVentas();
});

document.getElementById('limpiar-filtros').addEventListener('click', () => {
  filtros = { cliente: '', producto: '', fechaDesde: '', fechaHasta: '', metodo: '' };
  formFiltros.reset();
  renderVentas();
});

// Inicialización principal
(async function initVentas() {
  ventas = await cargarVentas();
  // Asegurar ID persistente para items que no provengan del backend
  ventas = ventas.map(v => {
    if (!v.id && !v._generatedId) {
      v._generatedId = 'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
    }
    return v;
  });
  asignarSecuenciales(ventas);
  ventasOrdenadas = [...ventas];
  renderVentas();
  window.addEventListener('resize', renderVentas);
})();
});
>>>>>>> rama-axel
