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
