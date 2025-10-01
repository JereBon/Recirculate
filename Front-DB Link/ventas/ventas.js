// ventas.js - Lógica mejorada para mostrar y gestionar el listado de ventas
// Incluye búsqueda, filtros, ordenamiento y conexión a API

const API_BASE_URL = 'http://localhost:3001/api';

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
    return [];
  }
}

function formatearFecha(iso) { 
  return iso ? new Date(iso).toLocaleDateString('es-AR') : ''; 
}

function formatearMoneda(v) { 
  const n = Number(v); 
  return "$ " + (isNaN(n) ? 0 : n).toLocaleString('es-AR', {minimumFractionDigits: 2}); 
}

document.addEventListener('DOMContentLoaded', async () => {
  let ventas = await cargarVentas();
  // Asegurar ID persistente para items que no provengan del backend
  ventas = ventas.map(v => {
    if (!v._id && !v.id && !v._generatedId) {
      v._generatedId = 'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
    }
    return v;
  });

  // Mapear a números secuenciales persistentes (cliente) para mostrar como #0001, #0002...
  const SEQ_KEY = 'ventas_seq_map';
  let seqMap = {};
  try { seqMap = JSON.parse(localStorage.getItem(SEQ_KEY)) || {}; } catch(e) { seqMap = {}; }
  // Calcular el siguiente número disponible
  let usedNums = Object.values(seqMap).map(n => Number(n)).filter(n => !isNaN(n));
  let nextNum = usedNums.length ? Math.max(...usedNums) + 1 : 1;
  ventas.forEach(v => {
    const pid = v._id || v.id || v._generatedId;
    if (!seqMap[pid]) {
      seqMap[pid] = nextNum++;
    }
  });
  try { localStorage.setItem(SEQ_KEY, JSON.stringify(seqMap)); } catch(e){}

  let ventasOrdenadas = [...ventas];
  function formatSeqNum(n) { return '#' + String(n).padStart(4, '0'); }
  // Estado de ordenamiento: campo actual y dirección (true = asc, false = desc)
  let sortState = { campo: null, asc: null };
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
  let filtros = { cliente: '', producto: '', fechaDesde: '', fechaHasta: '', metodo: '' };

  const tbody = document.getElementById('ventas-body');
  const totalDiv = document.getElementById('ventas-total');

  // Controles
  const inputBuscar = document.getElementById('q');
  const btnOrdenar = document.getElementById('btn-ordenar');
  const menuOrdenar = document.getElementById('menu-ordenar');

  const btnFiltrar = document.getElementById('btn-filtrar');
  const containerFiltros = document.querySelector('.container-filtros');
  const contFiltros = document.querySelector('.cont-filtros');
  const btnCerrarFiltros = document.getElementById('cerrar-filtros');
  const formFiltros = document.getElementById('form-filtros');

  function pasaFiltros(v) {
    if (filtros.cliente && !(v.cliente || '').toLowerCase().includes(filtros.cliente)) return false;
    if (filtros.producto && !(v.producto || '').toLowerCase().includes(filtros.producto)) return false;
    if (filtros.fechaDesde && new Date(v.createdAt || v.fecha) < new Date(filtros.fechaDesde)) return false;
    if (filtros.fechaHasta && new Date(v.createdAt || v.fecha) > new Date(filtros.fechaHasta)) return false;
    if (filtros.metodo && !(v.metodoPago || '').toLowerCase().includes(filtros.metodo)) return false;
    return true;
  }

  function renderVentas() {
    tbody.innerHTML = '';
    let total = 0;
    const isMobile = window.matchMedia('(max-width: 600px)').matches;

    ventasOrdenadas.forEach((venta, i) => {
      if (!pasaFiltros(venta)) return;

  const idx = i + 1;
  const val = Number(venta.total) || 0;
  const persistentId = venta._id || venta.id || venta._generatedId || idx;
  const seqNum = (function() { try { const m = JSON.parse(localStorage.getItem('ventas_seq_map')||'{}'); return m[persistentId]; } catch(e){return null;} })();
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
        <td data-label="Fecha">${formatearFecha(venta.createdAt || venta.fecha)}</td>
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
      // determinar dirección: si se clickeó el mismo campo, invertimos; si no, usamos el default
      if (sortState.campo === tipo) {
        sortState.asc = !sortState.asc;
      } else {
        sortState.campo = tipo;
        // defaults: monto/fecha -> desc, metodo/cliente -> asc
        if (tipo === 'monto' || tipo === 'fecha') sortState.asc = false;
        else sortState.asc = true;
      }

      const asc = sortState.asc ? 1 : -1;
      if (tipo === 'monto') {
        ventasOrdenadas.sort((a, b) => asc * ((Number(a.total) || 0) - (Number(b.total) || 0)));
      } else if (tipo === 'fecha') {
        ventasOrdenadas.sort((a, b) => asc * ((new Date(a.createdAt || a.fecha)).getTime() - (new Date(b.createdAt || b.fecha)).getTime()));
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
  // Inicializar texto del botón
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

  // Cerrar panel al hacer clic en el overlay
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

  // Render inicial y al redimensionar
  renderVentas();
  window.addEventListener('resize', renderVentas);
});