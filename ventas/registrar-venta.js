import { convertirCriptoAFiat, convertirFiatACripto } from '../assets/utils.js';

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
  if (venta.metodoPago === 'Cripto' && (!venta.montoCripto || venta.montoCripto <= 0)) {
    return 'Debe ingresar un monto válido en $ (fiat) para cripto.';
  }
  return true;
}

// Manejo del formulario
const form = document.getElementById('form-venta');
const successMsg = document.getElementById('success-msg');
const grupoCripto = document.getElementById('grupo-cripto');
const metodo = document.getElementById('metodo');
const montoCriptoInput = document.getElementById('monto-cripto');
const conversionCripto = document.getElementById('conversion-cripto');
const criptoTipoInput = document.getElementById('cripto-tipo');

// Mostrar/ocultar campo cripto según método de pago
metodo.addEventListener('change', () => {
  if (metodo.value === 'Cripto') {
    grupoCripto.style.display = '';
  } else {
    grupoCripto.style.display = 'none';
    conversionCripto.textContent = '';
  }
});

// Mostrar conversión cripto en tiempo real
montoCriptoInput.addEventListener('input', async () => {
  // Ahora el input es un monto en fiat: mostramos cuánto cripto equivale
  const montoFiat = Number(montoCriptoInput.value);
  const cripto = criptoTipoInput.value;
  if (montoFiat > 0) {
    const cantidadCripto = await convertirFiatACripto(montoFiat, cripto);
    // Mostrar con 6-8 decimales según la moneda
    conversionCripto.textContent = `Equivale a ${cantidadCripto.toFixed(8)} ${cripto.toUpperCase()}`;
  } else {
    conversionCripto.textContent = '';
  }
});
criptoTipoInput.addEventListener('change', async () => {
  const montoFiat = Number(montoCriptoInput.value);
  const cripto = criptoTipoInput.value;
  if (montoFiat > 0) {
    const cantidadCripto = await convertirFiatACripto(montoFiat, cripto);
    conversionCripto.textContent = `Equivale a ${cantidadCripto.toFixed(8)} ${cripto.toUpperCase()}`;
  } else {
    conversionCripto.textContent = '';
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  // Limpiar mensajes
  document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
  successMsg.textContent = '';

  // Crear objeto venta
  const venta = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    cliente: document.getElementById('cliente').value,
    producto: document.getElementById('producto').value,
    cantidad: Number(document.getElementById('cantidad').value),
    metodoPago: metodo.value,
    // montoCripto se calculará a partir del monto en fiat cuando el método sea Cripto
    montoCripto: metodo.value === 'Cripto' ? Number(montoCriptoInput.value) : null,
    total: 0 // Se calcula abajo
  };

  // Validar
  const valid = validarVenta(venta);
  if (valid !== true) {
    // Mostrar error en el primer campo que falle
    if (valid.includes('cliente')) document.getElementById('e-cliente').textContent = valid;
    else if (valid.includes('producto')) document.getElementById('e-producto').textContent = valid;
    else if (valid.includes('cantidad')) document.getElementById('e-cantidad').textContent = valid;
    else if (valid.includes('método')) document.getElementById('e-metodo').textContent = valid;
    else if (valid.includes('cripto')) document.getElementById('e-cripto').textContent = valid;
    return;
  }

  // Calcular total
  if (venta.metodoPago === 'Cripto') {
    const cripto = criptoTipoInput.value;
    // Aquí montoCripto en el objeto es el monto en fiat ingresado por el usuario
    const montoFiat = Number(montoCriptoInput.value);
    // Calcular cantidad de cripto equivalente
    const cantidadCripto = await convertirFiatACripto(montoFiat, cripto);
    venta.montoCripto = cantidadCripto;
    // El total que se registra es el monto en fiat que pagó el cliente
    venta.total = montoFiat;
  } else {
    // Para el sprint, el monto se calcula como cantidad * 10000 (ejemplo)
    venta.total = venta.cantidad * 10000;
  }

  // Guardar en localStorage
  const ventas = leerDatos('ventas');
  ventas.push(venta);
  guardarDatos('ventas', ventas);

  // Mensaje de éxito y limpiar formulario
  successMsg.textContent = '✅ Venta registrada con éxito';
  form.reset();
  grupoCripto.style.display = 'none';
  conversionCripto.textContent = '';
});
