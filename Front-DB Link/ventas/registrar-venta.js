// registrar-venta.js - Lógica del formulario de registro de ventas
// Maneja validaciones, persistencia, mensajes y conversión cripto.

// Utilidad para guardar datos en localStorage de forma segura
function guardarDatos(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    alert('No se pudo guardar la información (localStorage no disponible).');
  }
}

// Utilidad para leer datos de localStorage
function leerDatos(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

// Validación de los campos del formulario de venta
function validarVenta(venta) {
  if (!venta.cliente || venta.cliente.trim() === '') {
    return 'El cliente es obligatorio.';
  }
  if (!venta.producto || venta.producto.trim() === '') {
    return 'El producto es obligatorio.';
  }
  if (!venta.cantidad || venta.cantidad <= 0) {
    return 'La cantidad debe ser mayor a 0.';
  }
  if (!venta.metodoPago || venta.metodoPago === '') {
    return 'Debe seleccionar un método de pago.';
  }
  // Si el método es Cripto aceptamos que el usuario ingrese monto en pesos (montoPesos)
  // o directamente en cripto (montoCripto). Requerimos al menos uno válido.
  if (venta.metodoPago === 'Cripto') {
    const aceptaPesos = typeof venta.montoPesos === 'number' && venta.montoPesos > 0;
    const aceptaCripto = typeof venta.montoCripto === 'number' && venta.montoCripto > 0;
    if (!aceptaPesos && !aceptaCripto) {
      return 'Debe ingresar un monto válido (pesos o cripto).';
    }
  }
  return true;
}

// Conversión cripto → fiat usando API real (CoinGecko)
async function convertirCriptoAFiat(montoCripto) {
  // Puedes cambiar 'bitcoin' y 'usd' por la cripto y moneda que desees
  const cripto = 'bitcoin';
  const fiat = 'ars';
  try {
    const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cripto}&vs_currencies=${fiat}`);
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    const tasa = data[cripto][fiat];
    // Guarda la última tasa exitosa en localStorage para fallback
    localStorage.setItem('ultimaTasaCripto', tasa);
    return montoCripto * tasa;
  } catch (error) {
    // Fallback: usar última tasa guardada
    const ultimaTasa = Number(localStorage.getItem('ultimaTasaCripto'));
    if (ultimaTasa > 0) {
      return montoCripto * ultimaTasa;
    } else {
      alert('No se pudo obtener la tasa de cripto. Intente más tarde.');
      return 0;
    }
  }
}


const API_URL = "http://localhost:3001/api";
let productosDisponibles = [];

// Mini menú de productos con imagen y stock
async function cargarMenuProductos() {
  const menu = document.getElementById('menu-productos');
  const seleccionado = document.getElementById('producto-seleccionado');
  const inputHidden = document.getElementById('producto');
  menu.innerHTML = '<div style="padding:12px;color:#888;">Cargando productos...</div>';
  try {
    const res = await fetch(`${API_URL}/productos`);
    if (!res.ok) throw new Error('No se pudieron cargar los productos');
    const productos = await res.json();
    productosDisponibles = productos.filter(p => p.stock > 0);
    if (!productosDisponibles.length) {
      menu.innerHTML = '<div style="padding:12px;color:#888;">No hay productos con stock</div>';
      return;
    }
    menu.innerHTML = productosDisponibles.map(p => `
      <div class="opcion-producto" data-id="${p._id}" style="display:flex;align-items:center;gap:12px;padding:10px 14px;cursor:pointer;border-bottom:1px solid #f0f0f0;">
        ${p.imagenes && p.imagenes.length ? `<img src="${p.imagenes[0]}" alt="img" style="width:48px;height:48px;object-fit:cover;border-radius:8px;">` : `<span style='width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:#eee;border-radius:8px;color:#aaa;font-size:0.9em;'>Sin imagen</span>`}
        <div style="flex:1;">
          <div style="font-weight:bold;">${p.nombre}</div>
          <div style="font-size:0.95em;color:#666;">Stock: ${p.stock}</div>
        </div>
      </div>
    `).join('');
    // Evento click en cada opción
    menu.querySelectorAll('.opcion-producto').forEach(div => {
      div.addEventListener('click', () => {
        const prod = productosDisponibles.find(p => p._id === div.dataset.id);
        if (prod) {
          seleccionado.innerHTML = `
            ${prod.imagenes && prod.imagenes.length ? `<img src="${prod.imagenes[0]}" alt="img" style="width:48px;height:48px;object-fit:cover;border-radius:8px;">` : `<span style='width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:#eee;border-radius:8px;color:#aaa;font-size:0.9em;'>Sin imagen</span>`}
            <div style="flex:1;">
              <div style="font-weight:bold;">${prod.nombre}</div>
              <div style="font-size:0.95em;color:#666;">Stock: ${prod.stock}</div>
            </div>
          `;
          inputHidden.value = prod.nombre;
          menu.style.display = 'none';
        }
      });
    });
  } catch (err) {
    menu.innerHTML = `<div style='padding:12px;color:#e74c3c;'>${err.message}</div>`;
  }
}

// Mostrar/ocultar menú al hacer click
const selector = document.getElementById('producto-selector');
const menu = document.getElementById('menu-productos');
const seleccionado = document.getElementById('producto-seleccionado');
selector.addEventListener('click', () => {
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  if (menu.style.display === 'block') cargarMenuProductos();
});
// Cerrar menú si se hace click fuera
window.addEventListener('click', (e) => {
  if (!selector.contains(e.target)) menu.style.display = 'none';
});

// Cargar productos desde backend en el select
document.addEventListener('DOMContentLoaded', async () => {
  const selectProducto = document.getElementById('producto');
  try {
    const res = await fetch(`${API_URL}/productos`);
    if (!res.ok) throw new Error('No se pudieron cargar los productos');
    const productos = await res.json();
    productos.forEach(p => {
      const option = document.createElement('option');
      option.value = p.nombre;
      option.textContent = p.nombre;
      selectProducto.appendChild(option);
    });
  } catch (err) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Error al cargar productos';
    selectProducto.appendChild(option);
  }

  // Manejo del formulario
  const form = document.getElementById('form-venta');
  const successMsg = document.getElementById('success-msg');
  const grupoCripto = document.getElementById('grupo-cripto');
  const metodo = document.getElementById('metodo');
  const tipoCripto = document.getElementById('tipo-cripto');
  const montoPesosInput = document.getElementById('monto-pesos');
  const conversionCripto = document.getElementById('conversion-cripto');

  // Mostrar/ocultar campo cripto según método de pago
  metodo.addEventListener('change', () => {
    if (metodo.value === 'Cripto') {
      grupoCripto.style.display = '';
    } else {
      grupoCripto.style.display = 'none';
      conversionCripto.textContent = '';
    }
  });

  // Mostrar conversión pesos -> cripto en tiempo real
  async function calcularConversionPesosAPrecio(pesos) {
    const criptoId = tipoCripto.value || 'bitcoin';
    // Obtener precio (1 cripto -> ARS) y mostrar monto en cripto
    try {
      const fiat = 'ars';
      const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${criptoId}&vs_currencies=${fiat}`);
      if (!resp.ok) throw new Error('API error');
      const data = await resp.json();
      const tasa = data[criptoId][fiat];
      localStorage.setItem('ultimaTasaCripto_'+criptoId, tasa);
      const montoCripto = pesos / tasa;
      return { tasa, montoCripto };
    } catch (err) {
      const tasa = Number(localStorage.getItem('ultimaTasaCripto_'+(tipoCripto.value||'bitcoin')));
      if (tasa > 0) {
        return { tasa, montoCripto: pesos / tasa };
      }
      return { tasa: 0, montoCripto: 0 };
    }
  }

  montoPesosInput.addEventListener('input', async () => {
    const pesos = Number(montoPesosInput.value);
    if (pesos > 0) {
      const { montoCripto } = await calcularConversionPesosAPrecio(pesos);
      conversionCripto.textContent = `Equivale a ${montoCripto.toFixed(6)} ${tipoCripto.value === 'ethereum' ? 'ETH' : 'BTC'}`;
    } else {
      conversionCripto.textContent = '';
    }
  });

  // Recalcular conversión al cambiar el tipo de cripto sin necesidad de tocar el monto
  tipoCripto.addEventListener('change', async () => {
    const pesos = Number(montoPesosInput.value);
    if (pesos > 0) {
      const { montoCripto } = await calcularConversionPesosAPrecio(pesos);
      conversionCripto.textContent = `Equivale a ${montoCripto.toFixed(6)} ${tipoCripto.value === 'ethereum' ? 'ETH' : 'BTC'}`;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    successMsg.textContent = '';

    // Crear objeto venta
    const venta = {
      cliente: document.getElementById('cliente').value,
      producto: document.getElementById('producto').value,
      cantidad: Number(document.getElementById('cantidad').value),
      metodoPago: metodo.value,
      montoPesos: metodo.value === 'Cripto' ? Number(montoPesosInput.value) : null,
      montoCripto: null,
      total: 0, // Se calcula abajo
      fecha: new Date().toISOString() // Fecha de la venta
    };

    // Validar
    const valid = validarVenta(venta);
    if (valid !== true) {
      if (valid.includes('cliente')) document.getElementById('e-cliente').textContent = valid;
      else if (valid.includes('producto')) document.getElementById('e-producto').textContent = valid;
      else if (valid.includes('cantidad')) document.getElementById('e-cantidad').textContent = valid;
      else if (valid.includes('método')) document.getElementById('e-metodo').textContent = valid;
      else if (valid.includes('cripto')) document.getElementById('e-cripto').textContent = valid;
      return;
    }

    // Calcular total
    if (venta.metodoPago === 'Cripto') {
      if (!venta.montoPesos || venta.montoPesos <= 0) {
        document.getElementById('e-cripto').textContent = 'Debe ingresar un monto en pesos.';
        return;
      }
      // calcular monto en cripto a partir de pesos
      const { montoCripto } = await calcularConversionPesosAPrecio(venta.montoPesos);
      venta.montoCripto = Number(montoCripto.toFixed(8));
      venta.total = venta.montoPesos;
      venta.criptoTipo = tipoCripto.value || 'bitcoin';
    } else {
      venta.total = venta.cantidad * 10000;
    }

    // Enviar venta al backend
    try {
      const res = await fetch(`${API_URL}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venta)
      });
      if (!res.ok) throw new Error('Error al registrar la venta');
      successMsg.textContent = '✅ Venta registrada con éxito';
      form.reset();
      grupoCripto.style.display = 'none';
      conversionCripto.textContent = '';
    } catch (err) {
      successMsg.textContent = err.message;
    }
  });
});
