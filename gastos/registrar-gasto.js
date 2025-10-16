// registrar-gasto.js - Lógica del formulario de registro de gastos
// Maneja validaciones, persistencia, mensajes y conversión cripto.

const API_URL = "https://recirculate-api.onrender.com/gastos";

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
  if (!gasto.proveedor || gasto.proveedor.trim() === '') {
    return 'El proveedor es obligatorio.';
  }
  if (!gasto.concepto || gasto.concepto.trim() === '') {
    return 'El concepto es obligatorio.';
  }
  if (!gasto.monto || gasto.monto <= 0) {
    return 'El monto debe ser mayor a 0.';
  }
  if (!gasto.metodoPago || gasto.metodoPago === '') {
    return 'Debe seleccionar un método de pago.';
  }
  // Si el método es Cripto aceptamos que el usuario ingrese monto en pesos (montoPesos)
  // o directamente en cripto (montoCripto). Requerimos al menos uno válido.
  if (gasto.metodoPago === 'Cripto') {
    const aceptaPesos = typeof gasto.montoPesos === 'number' && gasto.montoPesos > 0;
    const aceptaCripto = typeof gasto.montoCripto === 'number' && gasto.montoCripto > 0;
    if (!aceptaPesos && !aceptaCripto) {
      return 'Debe ingresar un monto válido (pesos o cripto).';
    }
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
      proveedor: document.getElementById('proveedor').value,
      concepto: document.getElementById('concepto').value,
      monto: Number(document.getElementById('monto').value),
      metodoPago: metodo.value,
      montoPesos: metodo.value === 'Cripto' ? Number(montoPesosInput.value) : null,
      montoCripto: null,
      criptoTipo: null,
      total: 0 // Se calcula abajo
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
      if (!gasto.montoPesos || gasto.montoPesos <= 0) {
        document.getElementById('e-cripto').textContent = 'Debe ingresar un monto en pesos.';
        return;
      }
      const montoCripto = await convertirPesosACripto(gasto.montoPesos, tipoCripto.value || 'bitcoin');
      gasto.montoCripto = Number(montoCripto.toFixed(8));
      gasto.total = gasto.montoPesos;
      gasto.criptoTipo = tipoCripto.value || 'bitcoin';
    } else {
      gasto.total = gasto.monto;
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gasto)
      });
      if (!res.ok) throw new Error('Error al registrar el gasto');
      successMsg.textContent = '✅ Gasto registrado con éxito';
      form.reset();
      grupoCripto.style.display = 'none';
      conversionCripto.textContent = '';
    } catch (err) {
      successMsg.textContent = err.message;
    }
  });
});
