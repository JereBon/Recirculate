<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> rama-axel
// gastos.js — búsqueda / ordenar / filtrar con el mismo patrón de Ventas

function leerDatos(key){ try{ const d = localStorage.getItem(key); return d ? JSON.parse(d) : []; }catch{ return []; } }
function formatearFecha(iso){ return iso ? new Date(iso).toLocaleDateString('es-AR') : ''; }
function formatearMoneda(v){ const n = Number(v); return "$ " + (isNaN(n)?0:n).toLocaleString('es-AR',{minimumFractionDigits:2}); }

document.addEventListener('DOMContentLoaded', () => {
  let gastos = leerDatos('gastos');                 // { id, fecha, proveedor, concepto, monto, metodoPago, total? }
  let gastosOrdenados = [...gastos];               // base visible
  let filtros = { proveedor:'', fechaDesde:'', fechaHasta:'', metodo:'' };
<<<<<<< HEAD
=======
=======
// gastos.js - Lógica mejorada para mostrar y gestionar el listado de gastos
// Incluye búsqueda, filtros, ordenamiento y conexión a API

const API_BASE_URL = 'https://recirculate-api.onrender.com/api';

// Función para cargar gastos desde la API
async function cargarGastos() {
  try {
    const response = await fetch(`${API_BASE_URL}/gastos`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al cargar gastos:', error);
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
  let gastos = await cargarGastos();
  // Asegurar ID persistente para items que no provengan del backend
  gastos = gastos.map(g => {
    if (!g.id && !g._generatedId) {
      g._generatedId = 'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
    }
    return g;
  });

  // Mapear a números secuenciales persistentes (cliente) para mostrar como #0001, #0002...
  const SEQ_KEY_G = 'gastos_seq_map';
  let seqMapG = {};
  try { seqMapG = JSON.parse(localStorage.getItem(SEQ_KEY_G)) || {}; } catch(e) { seqMapG = {}; }
  let usedNumsG = Object.values(seqMapG).map(n => Number(n)).filter(n => !isNaN(n));
  let nextNumG = usedNumsG.length ? Math.max(...usedNumsG) + 1 : 1;
  gastos.forEach(g => {
    const pid = g.id || g._generatedId;
    if (!seqMapG[pid]) {
      seqMapG[pid] = nextNumG++;
    }
  });
  try { localStorage.setItem(SEQ_KEY_G, JSON.stringify(seqMapG)); } catch(e){}

  let gastosOrdenados = [...gastos];

  function formatSeqNumG(n) { return '#' + String(n).padStart(4, '0'); }
  // Estado de ordenamiento: campo actual y dirección (true = asc, false = desc)
  let sortState = { campo: null, asc: null };
  function updateOrdenButton() {
    const labels = { monto: 'monto', fecha: 'fecha', metodo: 'método' };
    if (!sortState.campo) {
      btnOrdenar.textContent = '⇅ Ordenar';
      return;
    }
    const dir = sortState.asc ? '↑' : '↓';
    const label = labels[sortState.campo] || sortState.campo;
    btnOrdenar.textContent = `⇅ Ordenar (${label} ${dir})`;
  }
  let filtros = { proveedor: '', fechaDesde: '', fechaHasta: '', metodo: '' };
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel

  const tbody = document.getElementById('gastos-body');
  const totalDiv = document.getElementById('gastos-total');

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> rama-axel
  // Controles (idénticos a Ventas)
  const inputBuscar = document.getElementById('q');
  const btnOrdenar  = document.getElementById('btn-ordenar');
  const menuOrdenar = document.getElementById('menu-ordenar');

  const btnFiltrar  = document.getElementById('btn-filtrar');
  const containerFiltros = document.querySelector('.container-filtros');
  const contFiltros      = document.querySelector('.cont-filtros');
  const btnCerrarFiltros = document.getElementById('cerrar-filtros');
  const formFiltros      = document.getElementById('form-filtros');

  function pasaFiltros(g){
    if (filtros.proveedor && !(g.proveedor||'').toLowerCase().includes(filtros.proveedor)) return false;
    if (filtros.fechaDesde && new Date(g.fecha) < new Date(filtros.fechaDesde)) return false;
    if (filtros.fechaHasta && new Date(g.fecha) > new Date(filtros.fechaHasta)) return false;
    if (filtros.metodo && !(g.metodoPago||'').toLowerCase().includes(filtros.metodo)) return false;
    return true;
  }

  function renderGastos(){
<<<<<<< HEAD
=======
=======
  // Controles
  const inputBuscar = document.getElementById('q');
  const btnOrdenar = document.getElementById('btn-ordenar');
  const menuOrdenar = document.getElementById('menu-ordenar');

  const btnFiltrar = document.getElementById('btn-filtrar');
  const containerFiltros = document.querySelector('.container-filtros');
  const contFiltros = document.querySelector('.cont-filtros');
  const btnCerrarFiltros = document.getElementById('cerrar-filtros');
  const formFiltros = document.getElementById('form-filtros');

  function pasaFiltros(g) {
    if (filtros.proveedor && !(g.proveedor || '').toLowerCase().includes(filtros.proveedor)) return false;
    if (filtros.fechaDesde && new Date(g.fecha_creacion || g.fecha) < new Date(filtros.fechaDesde)) return false;
    if (filtros.fechaHasta && new Date(g.fecha_creacion || g.fecha) > new Date(filtros.fechaHasta)) return false;
    if (filtros.metodo && !(g.metodoPago || '').toLowerCase().includes(filtros.metodo)) return false;
    return true;
  }

  function renderGastos() {
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
    tbody.innerHTML = '';
    let total = 0;
    const isMobile = window.matchMedia('(max-width: 600px)').matches;

    gastosOrdenados.forEach((gasto, i) => {
      if (!pasaFiltros(gasto)) return;

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> rama-axel
      const idx = i + 1;
      const val = Number(gasto.total ?? gasto.monto) || 0;

      if (isMobile){
        const trNum = document.createElement('tr');
        trNum.className = 'gasto-num-mobile';
        trNum.innerHTML = `<td colspan="6" class="gasto-num-mobile-td">Gasto #${idx}</td>`;
<<<<<<< HEAD
=======
=======
  const idx = i + 1;
  const val = Number(gasto.total) || 0;
  const persistentId = gasto.id || gasto._generatedId || idx;
  const seqNumG = (function() { try { const m = JSON.parse(localStorage.getItem('gastos_seq_map')||'{}'); return m[persistentId]; } catch(e){return null;} })();
  const displayId = seqNumG ? formatSeqNumG(seqNumG) : persistentId;

      if (isMobile) {
        const trNum = document.createElement('tr');
        trNum.className = 'gasto-num-mobile';
        trNum.innerHTML = `<td colspan="7" class="gasto-num-mobile-td">Gasto #${idx}</td>`;
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
        tbody.appendChild(trNum);
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> rama-axel
        <td data-label="ID">${idx}</td>
        <td data-label="Fecha">${formatearFecha(gasto.fecha)}</td>
        <td data-label="Proveedor">${gasto.proveedor||''}</td>
        <td data-label="Concepto">${gasto.concepto||''}</td>
        <td data-label="Monto">${formatearMoneda(val)}</td>
        <td data-label="Método de pago">${gasto.metodoPago||''}</td>
        <td data-label="Acciones">
          <button class="btn archivar" data-idx="${i}" title="Archivar gasto">📁</button>
          <button class="btn editar"   data-idx="${i}" title="Editar gasto">✏️</button>
<<<<<<< HEAD
=======
=======
  <td data-label="ID">${displayId}</td>
        <td data-label="Fecha">${formatearFecha(gasto.fecha_creacion || gasto.fecha)}</td>
        <td data-label="Proveedor">${gasto.proveedor || ''}</td>
        <td data-label="Concepto">${gasto.concepto || ''}</td>
        <td data-label="Monto">${formatearMoneda(val)}</td>
        <td data-label="Método de pago">${gasto.metodoPago || ''}</td>
        <td data-label="Acciones">
          <button class="btn archivar" data-id="${persistentId}" title="Archivar gasto">📁</button>
          <button class="btn editar" data-id="${persistentId}" title="Editar gasto">✏️</button>
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
        </td>
      `;
      tbody.appendChild(tr);
      total += val;
    });

    totalDiv.textContent = `Total gastado: ${formatearMoneda(total)}`;

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> rama-axel
    // Acciones (placeholder como lo tenías)
    document.querySelectorAll('.archivar').forEach(b=>b.onclick=e=>{
      const i = +e.currentTarget.dataset.idx; alert(`Gasto #${i+1} archivado (no implementado).`);
    });
    document.querySelectorAll('.editar').forEach(b=>b.onclick=e=>{
      const i = +e.currentTarget.dataset.idx; alert(`Editar gasto #${i+1} (llevar al formulario con datos).`);
<<<<<<< HEAD
=======
=======
    // Eventos para botones de acción
    document.querySelectorAll('.archivar').forEach(b => b.onclick = async e => {
      const id = e.currentTarget.dataset.id;
      if (confirm('¿Seguro que deseas archivar este gasto?')) {
        try {
          const res = await fetch(`${API_BASE_URL}/gastos/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Error al archivar');
          gastos = await cargarGastos();
          gastosOrdenados = [...gastos];
          renderGastos();
        } catch (err) {
          alert(err.message);
        }
      }
    });

    document.querySelectorAll('.editar').forEach(b => b.onclick = e => {
      const id = e.currentTarget.dataset.id;
      alert(`Editar gasto ID: ${id} (funcionalidad por implementar)`);
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
    });
  }

  // Búsqueda
  inputBuscar.addEventListener('input', () => {
    const q = inputBuscar.value.trim().toLowerCase();
    gastosOrdenados = gastos.filter(g =>
<<<<<<< HEAD
      !q || [g.proveedor, g.concepto, g.metodoPago].some(x => (x||'').toLowerCase().includes(q))
=======
<<<<<<< HEAD
      !q || [g.proveedor, g.concepto, g.metodoPago].some(x => (x||'').toLowerCase().includes(q))
=======
      !q || [g.proveedor, g.concepto, g.metodoPago].some(x => (x || '').toLowerCase().includes(q))
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
    );
    renderGastos();
  });

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> rama-axel
  // Orden
  btnOrdenar.addEventListener('click', () => {
    menuOrdenar.style.display = menuOrdenar.style.display === 'block' ? 'none' : 'block';
  });
<<<<<<< HEAD
=======
=======
  // Ordenamiento
  btnOrdenar.addEventListener('click', () => {
    menuOrdenar.style.display = menuOrdenar.style.display === 'block' ? 'none' : 'block';
  });

>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
  document.addEventListener('click', (e) => {
    if (!btnOrdenar.contains(e.target) && !menuOrdenar.contains(e.target)) {
      menuOrdenar.style.display = 'none';
    }
  });
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> rama-axel
  menuOrdenar.querySelectorAll('.ordenar-opcion').forEach(btn => {
    btn.addEventListener('click', () => {
      const tipo = btn.dataset.orden;
      if (tipo === 'monto'){
        gastosOrdenados.sort((a,b)=>(Number(b.total??b.monto)||0)-(Number(a.total??a.monto)||0));
      } else if (tipo === 'fecha'){
        gastosOrdenados.sort((a,b)=> new Date(b.fecha) - new Date(a.fecha));
      } else if (tipo === 'metodo'){
        gastosOrdenados.sort((a,b)=> (a.metodoPago||'').localeCompare(b.metodoPago||''));
      }
      menuOrdenar.style.display = 'none';
      renderGastos();
    });
  });

  // Filtros (panel lateral)
  btnFiltrar.addEventListener('click', () => {
    containerFiltros.classList.add('show');
    setTimeout(()=>contFiltros.classList.add('slide'),10);
  });
  btnCerrarFiltros.addEventListener('click', () => {
    contFiltros.classList.remove('slide');
    setTimeout(()=>containerFiltros.classList.remove('show'),300);
  });
  formFiltros.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(formFiltros);
    filtros.proveedor  = (fd.get('proveedor')  || '').toLowerCase();
    filtros.fechaDesde = (fd.get('fechaDesde') || '');
    filtros.fechaHasta = (fd.get('fechaHasta') || '');
    filtros.metodo     = (fd.get('metodo')     || '').toLowerCase();
    contFiltros.classList.remove('slide');
    setTimeout(()=>containerFiltros.classList.remove('show'),300);
    renderGastos();
  });
  document.getElementById('limpiar-filtros').addEventListener('click', () => {
    filtros = { proveedor:'', fechaDesde:'', fechaHasta:'', metodo:'' };
<<<<<<< HEAD
=======
=======

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
        gastosOrdenados.sort((a, b) => asc * ((Number(a.total) || 0) - (Number(b.total) || 0)));
      } else if (tipo === 'fecha') {
        gastosOrdenados.sort((a, b) => asc * ((new Date(a.fecha_creacion || a.fecha)).getTime() - (new Date(b.fecha_creacion || b.fecha)).getTime()));
      } else if (tipo === 'metodo') {
        gastosOrdenados.sort((a, b) => asc * ((a.metodoPago || '').localeCompare(b.metodoPago || '')));
      }
      menuOrdenar.style.display = 'none';
      updateOrdenButton();
      renderGastos();
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
    filtros.proveedor = (fd.get('proveedor') || '').toLowerCase();
    filtros.fechaDesde = (fd.get('fechaDesde') || '');
    filtros.fechaHasta = (fd.get('fechaHasta') || '');
    filtros.metodo = (fd.get('metodo') || '').toLowerCase();
    
    contFiltros.classList.remove('slide');
    setTimeout(() => containerFiltros.classList.remove('show'), 300);
    renderGastos();
  });

  document.getElementById('limpiar-filtros').addEventListener('click', () => {
    filtros = { proveedor: '', fechaDesde: '', fechaHasta: '', metodo: '' };
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
    formFiltros.reset();
    renderGastos();
  });

<<<<<<< HEAD
  // Render inicial + al redimensionar
=======
<<<<<<< HEAD
  // Render inicial + al redimensionar
=======
  // Render inicial y al redimensionar
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
  renderGastos();
  window.addEventListener('resize', renderGastos);
});
