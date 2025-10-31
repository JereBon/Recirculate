// utils.js - Funciones utilitarias compartidas para RecirculateV1

// Guardar datos en localStorage de forma segura
export function guardarDatos(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    alert('No se pudo guardar la información (localStorage no disponible).');
  }
}

// Leer datos de localStorage
export function leerDatos(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

// Conversión cripto → fiat usando API real (CoinGecko), con fallback a última tasa
export async function convertirCriptoAFiat(montoCripto, cripto = 'bitcoin') {
  const fiat = 'ars';
  try {
    const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cripto}&vs_currencies=${fiat}`);
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    const tasa = data[cripto][fiat];
    localStorage.setItem('ultimaTasaCripto_' + cripto, tasa);
    return montoCripto * tasa;
  } catch (error) {
    const ultimaTasa = Number(localStorage.getItem('ultimaTasaCripto_' + cripto));
    if (ultimaTasa > 0) {
      return montoCripto * ultimaTasa;
    } else {
      alert('No se pudo obtener la tasa de cripto. Intente más tarde.');
      return 0;
    }
  }
}

// Conversión fiat -> cripto usando la misma lógica (CoinGecko) con fallback a la última tasa
export async function convertirFiatACripto(montoFiat, cripto = 'bitcoin') {
  const fiat = 'ars';
  try {
    const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cripto}&vs_currencies=${fiat}`);
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    const tasa = data[cripto][fiat]; // precio de 1 unidad de cripto en fiat
    localStorage.setItem('ultimaTasaCripto_' + cripto, tasa);
    // cantidad de cripto = monto fiat / tasa (fiat por 1 cripto)
    return montoFiat / tasa;
  } catch (error) {
    const ultimaTasa = Number(localStorage.getItem('ultimaTasaCripto_' + cripto));
    if (ultimaTasa > 0) {
      return montoFiat / ultimaTasa;
    } else {
      alert('No se pudo obtener la tasa de cripto. Intente más tarde.');
      return 0;
    }
  }
}

// ============================================
// FUNCIONES DEL CARRITO DE COMPRAS
// ============================================

// Función para agregar producto al carrito
export function agregarAlCarrito(producto) {
  // Obtener carrito actual
  let carrito = JSON.parse(localStorage.getItem('recirculate_carrito') || '[]');
  
  // Verificar si el producto ya existe en el carrito
  const productoExistente = carrito.find(item => item.id === producto.id);
  
  if (productoExistente) {
    // Si existe, aumentar cantidad
    productoExistente.cantidad++;
  } else {
    // Si no existe, agregarlo con cantidad 1
    carrito.push({
      ...producto,
      cantidad: 1
    });
  }
  
  // Guardar carrito actualizado
  localStorage.setItem('recirculate_carrito', JSON.stringify(carrito));
  
  // Actualizar contador
  actualizarContadorCarrito();
  
  // Mostrar feedback visual
  mostrarNotificacion('Producto agregado al carrito');
}

// Función para actualizar el contador del carrito
export function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('recirculate_carrito') || '[]');
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  
  const contador = document.getElementById('cart-counter');
  if (contador) {
    contador.textContent = totalItems;
  }
}

// Función para mostrar notificaciones
export function mostrarNotificacion(mensaje, tipo = 'success') {
  // Crear elemento de notificación
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion notificacion-${tipo}`;
  notificacion.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${mensaje}</span>
  `;
  
  // Agregar estilos inline
  notificacion.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${tipo === 'success' ? '#27ae60' : '#e74c3c'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: slideInRight 0.3s ease-out;
  `;
  
  document.body.appendChild(notificacion);
  
  // Eliminar después de 3 segundos
  setTimeout(() => {
    notificacion.style.opacity = '0';
    notificacion.style.transform = 'translateX(400px)';
    notificacion.style.transition = 'all 0.3s ease-out';
    setTimeout(() => notificacion.remove(), 300);
  }, 3000);
}

// Función para obtener productos del carrito
export function obtenerCarrito() {
  return JSON.parse(localStorage.getItem('recirculate_carrito') || '[]');
}

// Función para vaciar el carrito
export function vaciarCarrito() {
  localStorage.removeItem('recirculate_carrito');
  actualizarContadorCarrito();
<<<<<<< HEAD
}
=======
<<<<<<< HEAD
}
=======
}
>>>>>>> 7e44d96cd7813967b3a60a834cefdad9f2e3cb61
>>>>>>> rama-axel
