const API_URL = "https://recirculate-api.onrender.com/api/productos";

document.getElementById("formProducto").addEventListener("submit", async (e) => {
  e.preventDefault();
  limpiarMensajes();

  // Obtener todos los valores del formulario
  const nombre = document.getElementById("nombre").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const genero = document.getElementById("genero").value.trim();
  const talle = document.getElementById("talle").value.trim();
  const color = document.getElementById("color").value.trim();
  const marca = document.getElementById("marca").value.trim();
  const precio = Number(document.getElementById("precio").value);
  const stock = Number(document.getElementById("stock").value);
  const proveedor = document.getElementById("proveedor").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const imagen_url = document.getElementById("imagen_url").value.trim();

  // Validaciones obligatorias
  if (!nombre) {
    mostrarError("El nombre del producto es obligatorio.");
    return;
  }

  if (!genero) {
    mostrarError("Debes seleccionar un género para la prenda (Hombre/Mujer/Unisex).");
    return;
  }

  if (!categoria) {
    mostrarError("Debes seleccionar una categoría.");
    return;
  }

  if (precio <= 0) {
    mostrarError("El precio debe ser mayor a 0.");
    return;
  }

  if (stock < 0) {
    mostrarError("El stock no puede ser negativo.");
    return;
  }

  // Validación de URL de imagen (si se proporciona)
  if (imagen_url && !isValidURL(imagen_url)) {
    mostrarError("La URL de imagen no es válida.");
    return;
  }

  // Preparar datos para enviar
  const productData = {
    nombre,
    descripcion: descripcion || null,
    categoria,
    genero, // Campo obligatorio
    talle: talle || null,
    color: color || null,
    marca: marca || null,
    precio,
    stock,
    proveedor: proveedor || null,
    imagen_url: imagen_url || null,
    estado: stock > 0 ? 'Disponible' : 'Sin stock'
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('authToken')}` // Si requiere autenticación
      },
      body: JSON.stringify(productData)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al guardar el producto");
    }

    const result = await res.json();
    mostrarExito(`Producto "${nombre}" guardado correctamente en la sección ${genero.toUpperCase()} ✅`);
    document.getElementById("formProducto").reset();
    
    // Opcional: Redirigir a la lista de productos después de 2 segundos
    setTimeout(() => {
      window.location.href = 'ver-productos.html';
    }, 2000);

  } catch (err) {
    console.error("Error:", err);
    mostrarError(err.message);
  }
});

// Función para validar URL
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Validación en tiempo real del campo género
document.getElementById("genero").addEventListener("change", function() {
  const genero = this.value;
  if (genero) {
    this.style.borderColor = "#28a745";
    this.style.backgroundColor = "#f8fff8";
  } else {
    this.style.borderColor = "#dc3545";
    this.style.backgroundColor = "#fff5f5";
  }
});

// Mostrar indicador visual para campos obligatorios
document.querySelectorAll("input[required], select[required]").forEach(field => {
  field.addEventListener("blur", function() {
    if (!this.value.trim()) {
      this.style.borderColor = "#dc3545";
    } else {
      this.style.borderColor = "#28a745";
    }
  });
});

function mostrarError(msg) {
  document.getElementById("errorProducto").textContent = msg;
  document.getElementById("errorProducto").scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function mostrarExito(msg) {
  document.getElementById("successProducto").textContent = msg;
  document.getElementById("successProducto").scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function limpiarMensajes() {
  document.getElementById("errorProducto").textContent = "";
  document.getElementById("successProducto").textContent = "";
}