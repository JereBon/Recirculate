// registrar-gasto.js - Lógica del formulario de registro de gastos
// Maneja validaciones, persistencia, mensajes y conversión cripto.

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
const API_URL = "https://recirculate-api.onrender.com/api/gastos";

>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
function guardarDatos(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    alert('No se pudo guardar la información (localStorage no disponible).');
  }
}

function leerDatos(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

function validarGasto(gasto) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> rama-axel
  if (!gasto.proveedor || gasto.proveedor.trim() === '') {
    return 'El proveedor es obligatorio.';
  }
  if (!gasto.concepto || gasto.concepto.trim() === '') {
<<<<<<< HEAD
=======
=======
  if (!gasto.categoria || gasto.categoria.trim() === '') {
    return 'El proveedor es obligatorio.';
  }
  if (!gasto.descripcion || gasto.descripcion.trim() === '') {
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
    return 'El concepto es obligatorio.';
  }
  if (!gasto.monto || gasto.monto <= 0) {
    return 'El monto debe ser mayor a 0.';
  }
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> rama-axel
  if (!gasto.metodoPago || gasto.metodoPago === '') {
    return 'Debe seleccionar un método de pago.';
  }
  if (gasto.metodoPago === 'Cripto' && (!gasto.montoCripto || gasto.montoCripto <= 0)) {
    return 'Debe ingresar un monto válido en cripto.';
  }
  return true;
}

async function convertirCriptoAFiat(montoCripto) {
  const tasa = 500000; // Simulación
  return montoCripto * tasa;
}

const form = document.getElementById('form-gasto');
const successMsg = document.getElementById('success-msg');
const grupoCripto = document.getElementById('grupo-cripto');
const metodo = document.getElementById('metodo');
const montoCriptoInput = document.getElementById('monto-cripto');
const conversionCripto = document.getElementById('conversion-cripto');

metodo.addEventListener('change', () => {
  if (metodo.value === 'Cripto') {
    grupoCripto.style.display = '';
  } else {
    grupoCripto.style.display = 'none';
    conversionCripto.textContent = '';
  }
});

montoCriptoInput.addEventListener('input', async () => {
  const monto = Number(montoCriptoInput.value);
  if (monto > 0) {
    const fiat = await convertirCriptoAFiat(monto);
    conversionCripto.textContent = `Equivale a $${fiat.toLocaleString('es-AR')}`;
  } else {
    conversionCripto.textContent = '';
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
  successMsg.textContent = '';

  const gasto = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    proveedor: document.getElementById('proveedor').value,
    concepto: document.getElementById('concepto').value,
    monto: Number(document.getElementById('monto').value),
    metodoPago: metodo.value,
    montoCripto: metodo.value === 'Cripto' ? Number(montoCriptoInput.value) : null,
    total: 0
  };

  const valid = validarGasto(gasto);
  if (valid !== true) {
    if (valid.includes('proveedor')) document.getElementById('e-proveedor').textContent = valid;
    else if (valid.includes('concepto')) document.getElementById('e-concepto').textContent = valid;
    else if (valid.includes('monto')) document.getElementById('e-monto').textContent = valid;
    else if (valid.includes('método')) document.getElementById('e-metodo').textContent = valid;
    else if (valid.includes('cripto')) document.getElementById('e-cripto').textContent = valid;
    return;
  }

  if (gasto.metodoPago === 'Cripto') {
    gasto.total = await convertirCriptoAFiat(gasto.montoCripto);
  } else {
    gasto.total = gasto.monto;
  }

  const gastos = leerDatos('gastos');
  gastos.push(gasto);
  guardarDatos('gastos', gastos);

  successMsg.textContent = '✅ Gasto registrado con éxito';
  form.reset();
  grupoCripto.style.display = 'none';
  conversionCripto.textContent = '';
<<<<<<< HEAD
=======
=======
  if (!gasto.metodo_pago || gasto.metodo_pago === '') {
    return 'Debe seleccionar un método de pago.';
  }
  return true;
}

async function convertirCriptoAFiat(montoCripto, criptoId = 'bitcoin') {
  // montoCripto -> devuelve ARS
  try {
    const fiat = 'ars';
    const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${criptoId}&vs_currencies=${fiat}`);
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    const tasa = data[criptoId][fiat];
    localStorage.setItem('ultimaTasaCripto_'+criptoId, tasa);
    return montoCripto * tasa;
  } catch (err) {
    const tasa = Number(localStorage.getItem('ultimaTasaCripto_'+criptoId));
    if (tasa > 0) return montoCripto * tasa;
    return 0;
  }
}

async function convertirPesosACripto(pesos, criptoId = 'bitcoin') {
  try {
    const fiat = 'ars';
    const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${criptoId}&vs_currencies=${fiat}`);
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    const tasa = data[criptoId][fiat];
    localStorage.setItem('ultimaTasaCripto_'+criptoId, tasa);
    return pesos / tasa;
  } catch (err) {
    const tasa = Number(localStorage.getItem('ultimaTasaCripto_'+criptoId));
    if (tasa > 0) return pesos / tasa;
    return 0;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-gasto');
  const successMsg = document.getElementById('success-msg');
  const grupoCripto = document.getElementById('grupo-cripto');
  const metodo = document.getElementById('metodo');
  const tipoCripto = document.getElementById('tipo-cripto');
  const montoPesosInput = document.getElementById('monto-pesos');
  const conversionCripto = document.getElementById('conversion-cripto');

  metodo.addEventListener('change', () => {
    if (metodo.value === 'Cripto') {
      grupoCripto.style.display = '';
    } else {
      grupoCripto.style.display = 'none';
      conversionCripto.textContent = '';
    }
  });

  montoPesosInput.addEventListener('input', async () => {
    const pesos = Number(montoPesosInput.value);
    if (pesos > 0) {
      const montoCripto = await convertirPesosACripto(pesos, tipoCripto.value || 'bitcoin');
      conversionCripto.textContent = `Equivale a ${montoCripto.toFixed(6)} ${tipoCripto.value === 'ethereum' ? 'ETH' : 'BTC'}`;
    } else {
      conversionCripto.textContent = '';
    }
  });

  tipoCripto.addEventListener('change', async () => {
    const pesos = Number(montoPesosInput.value);
    if (pesos > 0) {
      const montoCripto = await convertirPesosACripto(pesos, tipoCripto.value || 'bitcoin');
      conversionCripto.textContent = `Equivale a ${montoCripto.toFixed(6)} ${tipoCripto.value === 'ethereum' ? 'ETH' : 'BTC'}`;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    successMsg.textContent = '';

    const gasto = {
      descripcion: document.getElementById('concepto').value,
      categoria: document.getElementById('proveedor').value, // El proveedor se usará como categoría
      monto: Number(document.getElementById('monto').value),
      fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
      metodo_pago: metodo.value
    };

    const valid = validarGasto(gasto);
    if (valid !== true) {
      if (valid.includes('proveedor')) document.getElementById('e-proveedor').textContent = valid;
      else if (valid.includes('concepto')) document.getElementById('e-concepto').textContent = valid;
      else if (valid.includes('monto')) document.getElementById('e-monto').textContent = valid;
      else if (valid.includes('método')) document.getElementById('e-metodo').textContent = valid;
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        successMsg.textContent = 'Debe estar autenticado para registrar gastos';
        successMsg.style.color = '#e74c3c'; // Color rojo para errores
        return;
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(gasto)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al registrar el gasto');
      }
      
      successMsg.textContent = '✅ Gasto registrado con éxito';
      successMsg.style.color = '#27ae60'; // Color verde para éxito
      form.reset();
      grupoCripto.style.display = 'none';
      conversionCripto.textContent = '';
    } catch (err) {
      successMsg.textContent = `❌ ${err.message}`;
      successMsg.style.color = '#e74c3c'; // Color rojo para errores
    }
  });
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
});
