// gastos.js — búsqueda / ordenar / filtrar con el mismo patrón de Ventas

function leerDatos(key){ try{ const d = localStorage.getItem(key); return d ? JSON.parse(d) : []; }catch{ return []; } }
function formatearFecha(iso){ return iso ? new Date(iso).toLocaleDateString('es-AR') : ''; }
function formatearMoneda(v){ const n = Number(v); return "$ " + (isNaN(n)?0:n).toLocaleString('es-AR',{minimumFractionDigits:2}); }

document.addEventListener('DOMContentLoaded', () => {
  let gastos = leerDatos('gastos');                 // { id, fecha, proveedor, concepto, monto, metodoPago, total? }
  let gastosOrdenados = [...gastos];               // base visible
  let filtros = { proveedor:'', fechaDesde:'', fechaHasta:'', metodo:'' };

  const tbody = document.getElementById('gastos-body');
  const totalDiv = document.getElementById('gastos-total');

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
    tbody.innerHTML = '';
    let total = 0;
    const isMobile = window.matchMedia('(max-width: 600px)').matches;

    gastosOrdenados.forEach((gasto, i) => {
      if (!pasaFiltros(gasto)) return;

      const idx = i + 1;
      const val = Number(gasto.total ?? gasto.monto) || 0;

      if (isMobile){
        const trNum = document.createElement('tr');
        trNum.className = 'gasto-num-mobile';
        trNum.innerHTML = `<td colspan="6" class="gasto-num-mobile-td">Gasto #${idx}</td>`;
        tbody.appendChild(trNum);
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="ID">${idx}</td>
        <td data-label="Fecha">${formatearFecha(gasto.fecha)}</td>
        <td data-label="Proveedor">${gasto.proveedor||''}</td>
        <td data-label="Concepto">${gasto.concepto||''}</td>
        <td data-label="Monto">${formatearMoneda(val)}</td>
        <td data-label="Método de pago">${gasto.metodoPago||''}</td>
        <td data-label="Acciones">
          <button class="btn archivar" data-idx="${i}" title="Archivar gasto">📁</button>
          <button class="btn editar"   data-idx="${i}" title="Editar gasto">✏️</button>
        </td>
      `;
      tbody.appendChild(tr);
      total += val;
    });

    totalDiv.textContent = `Total gastado: ${formatearMoneda(total)}`;

    // Acciones (placeholder como lo tenías)
    document.querySelectorAll('.archivar').forEach(b=>b.onclick=e=>{
      const i = +e.currentTarget.dataset.idx; alert(`Gasto #${i+1} archivado (no implementado).`);
    });
    document.querySelectorAll('.editar').forEach(b=>b.onclick=e=>{
      const i = +e.currentTarget.dataset.idx; alert(`Editar gasto #${i+1} (llevar al formulario con datos).`);
    });
  }

  // Búsqueda
  inputBuscar.addEventListener('input', () => {
    const q = inputBuscar.value.trim().toLowerCase();
    gastosOrdenados = gastos.filter(g =>
      !q || [g.proveedor, g.concepto, g.metodoPago].some(x => (x||'').toLowerCase().includes(q))
    );
    renderGastos();
  });

  // Orden
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
    formFiltros.reset();
    renderGastos();
  });

  // Render inicial + al redimensionar
  renderGastos();
  window.addEventListener('resize', renderGastos);
});
