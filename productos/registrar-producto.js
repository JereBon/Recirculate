const API_URL = "https://recirculate-api.onrender.com/api/productos";

document.getElementById("formProducto").addEventListener("submit", async (e) => {
  e.preventDefault();
  limpiarMensajes();

  // Obtener todos los valores del formulario
  const nombre = document.getElementById("nombre").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const genero = document.getElementById("genero").value;
  const estado = document.getElementById("estado").value;
  const talle = document.getElementById("talle").value.trim();
  const color = document.getElementById("color").value.trim();
  const marca = document.getElementById("marca").value.trim();
  const precio = Number(document.getElementById("precio").value);
  const stock = Number(document.getElementById("stock").value);
  const imagen_url = document.getElementById("imagen_url").value.trim();
  const proveedor = document.getElementById("proveedor").value.trim();
  const destacado = document.getElementById("destacado").checked;

  // Validaciones
  if (!nombre) {
    mostrarError("El nombre es obligatorio.");
    return;
  }
  
  if (!genero) {
    mostrarError("Debe seleccionar un género.");
    return;
  }
  
  if (!estado) {
    mostrarError("Debe seleccionar el estado del producto.");
    return;
  }
  
  if (precio < 0) {
    mostrarError("El precio no puede ser negativo.");
    return;
  }
  
  if (stock < 0) {
    mostrarError("El stock no puede ser negativo.");
    return;
  }

  // Preparar datos para enviar
  const productoData = {
    nombre,
    descripcion: descripcion || null,
    categoria: categoria || null,
    genero,
    estado,
    talle: talle || null,
    color: color || null,
    marca: marca || null,
    precio,
    stock,
    imagen_url: imagen_url || null,
    proveedor: proveedor || null,
    destacado
  };

  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      mostrarError("Debe estar autenticado para crear productos.");
      return;
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(productoData)
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Error al guardar el producto");
    }
    
    const nuevoProducto = await res.json();
    mostrarExito(`Producto "${nuevoProducto.nombre}" guardado correctamente ✅`);
    document.getElementById("formProducto").reset();
    
    // Marcar destacado por defecto de nuevo
    document.getElementById("destacado").checked = true;
  } catch (err) {
    mostrarError(err.message);
  }
});

function mostrarError(msg) {
  document.getElementById("errorProducto").textContent = msg;
}
function mostrarExito(msg) {
  document.getElementById("successProducto").textContent = msg;
}
function limpiarMensajes() {
  mostrarError("");
  mostrarExito("");
}