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
  if (venta.metodoPago === 'Cripto') {
    const aceptaPesos = typeof venta.montoPesos === 'number' && venta.montoPesos > 0;
    const aceptaCripto = typeof venta.montoCripto === 'number' && venta.montoCripto > 0;
    if (!aceptaPesos && !aceptaCripto) {
      return 'Debe ingresar un monto válido (pesos o cripto).';
    }
  }
  return true;
}
// --- Lógica combinada y mejorada para registrar ventas ---
const API_URL = "https://recirculate-api.onrender.com/api";
let productosDisponibles = [];



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
      const token = localStorage.getItem('authToken');
      if (!token) {
        successMsg.textContent = 'Debe estar autenticado para registrar ventas';
        return;
      }

      const res = await fetch(`${API_URL}/ventas`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
