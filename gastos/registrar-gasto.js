// registrar-gasto.js - Lógica del formulario de registro de gastos
// Maneja validaciones, persistencia, mensajes y conversión cripto.

import { convertirCriptoAFiat } from '../assets/utils.js';

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
  if (gasto.metodoPago === 'Cripto' && (!gasto.montoCripto || gasto.montoCripto <= 0)) {
    return 'Debe ingresar un monto válido en cripto.';
  }
  return true;
}

const form = document.getElementById('form-gasto');
const successMsg = document.getElementById('success-msg');
const grupoCripto = document.getElementById('grupo-cripto');
const criptoTipoGroup = document.getElementById('cripto-tipo-group');
const metodo = document.getElementById('metodo');
const montoCriptoInput = document.getElementById('monto-cripto');
const conversionCripto = document.getElementById('conversion-cripto');
const criptoTipoInput = document.getElementById('cripto-tipo');

metodo.addEventListener('change', () => {
  if (metodo.value === 'Cripto') {
    grupoCripto.style.display = '';
    criptoTipoGroup.style.display = '';
  } else {
    grupoCripto.style.display = 'none';
    criptoTipoGroup.style.display = 'none';
    conversionCripto.textContent = '';
  }
});

montoCriptoInput.addEventListener('input', async () => {
  const monto = Number(montoCriptoInput.value);
  const cripto = criptoTipoInput.value;
  if (monto > 0) {
    const fiat = await convertirCriptoAFiat(monto, cripto);
    conversionCripto.textContent = `Equivale a $${fiat.toLocaleString('es-AR')}`;
  } else {
    conversionCripto.textContent = '';
  }
});

criptoTipoInput.addEventListener('change', async () => {
  const monto = Number(montoCriptoInput.value);
  const cripto = criptoTipoInput.value;
  if (monto > 0) {
    const fiat = await convertirCriptoAFiat(monto, cripto);
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
    const cripto = criptoTipoInput.value;
    gasto.total = await convertirCriptoAFiat(gasto.montoCripto, cripto);
  } else {
    gasto.total = gasto.monto;
  }

  const gastos = leerDatos('gastos');
  gastos.push(gasto);
  guardarDatos('gastos', gastos);

  successMsg.textContent = '✅ Gasto registrado con éxito';
  form.reset();
  grupoCripto.style.display = 'none';
  criptoTipoGroup.style.display = 'none';
  conversionCripto.textContent = '';
});
