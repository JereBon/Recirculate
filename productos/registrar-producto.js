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
  const descuento = Number(document.getElementById("descuento").value) || 0;
  const proveedor = document.getElementById("proveedor").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const imagen_url = document.getElementById("imagen_url").value.trim();

  // Validaciones obligatorias
  if (!nombre) {
    mostrarError("El nombre del producto es obligatorio.", "nombre");
    return;
  }

  if (!genero) {
    mostrarError("Debes seleccionar un género para la prenda (Hombre/Mujer/Unisex).", "genero");
    return;
  }

  if (!categoria) {
    mostrarError("Debes seleccionar una categoría.", "categoria");
    return;
  }

  if (precio <= 0) {
    mostrarError("El precio debe ser mayor a 0.", "precio");
    return;
  }

  if (stock < 0) {
    mostrarError("El stock no puede ser negativo.", "stock");
    return;
  }

  if (descuento < 0 || descuento > 100) {
    mostrarError("El descuento debe estar entre 0 y 100%.", "descuento");
    return;
  }

  // Validación de URL de imagen (si se proporciona)
  if (imagen_url && !isValidURL(imagen_url)) {
    mostrarError("La URL de imagen no es válida.", "imagen_url");
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
    descuento, // Nuevo campo de descuento
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

// Validaciones en tiempo real
document.getElementById("nombre").addEventListener("blur", function() {
  const errorEl = document.getElementById("e-nombre");
  if (!this.value.trim()) {
    errorEl.textContent = "El nombre es obligatorio";
    this.style.borderColor = "#dc3545";
  } else {
    errorEl.textContent = "";
    this.style.borderColor = "#28a745";
  }
});

document.getElementById("genero").addEventListener("change", function() {
  const errorEl = document.getElementById("e-genero");
  if (!this.value) {
    errorEl.textContent = "Debes seleccionar un género";
    this.style.borderColor = "#dc3545";
  } else {
    errorEl.textContent = "";
    this.style.borderColor = "#28a745";
  }
});

document.getElementById("categoria").addEventListener("change", function() {
  const errorEl = document.getElementById("e-categoria");
  if (!this.value) {
    errorEl.textContent = "Debes seleccionar una categoría";
    this.style.borderColor = "#dc3545";
  } else {
    errorEl.textContent = "";
    this.style.borderColor = "#28a745";
  }
});

document.getElementById("precio").addEventListener("blur", function() {
  const errorEl = document.getElementById("e-precio");
  const precio = Number(this.value);
  if (!this.value || precio <= 0) {
    errorEl.textContent = "El precio debe ser mayor a 0";
    this.style.borderColor = "#dc3545";
  } else {
    errorEl.textContent = "";
    this.style.borderColor = "#28a745";
  }
});

document.getElementById("stock").addEventListener("blur", function() {
  const errorEl = document.getElementById("e-stock");
  const stock = Number(this.value);
  if (this.value === "" || stock < 0) {
    errorEl.textContent = "El stock no puede ser negativo";
    this.style.borderColor = "#dc3545";
  } else {
    errorEl.textContent = "";
    this.style.borderColor = "#28a745";
  }
});

document.getElementById("descuento").addEventListener("blur", function() {
  const errorEl = document.getElementById("e-descuento");
  const descuento = Number(this.value);
  if (this.value !== "" && (descuento < 0 || descuento > 100)) {
    errorEl.textContent = "El descuento debe estar entre 0 y 100%";
    this.style.borderColor = "#dc3545";
  } else {
    errorEl.textContent = "";
    this.style.borderColor = this.value ? "#28a745" : "";
  }
});

document.getElementById("imagen_url").addEventListener("blur", function() {
  const errorEl = document.getElementById("e-imagen_url");
  if (this.value && !isValidURL(this.value)) {
    errorEl.textContent = "La URL no es válida";
    this.style.borderColor = "#dc3545";
  } else {
    errorEl.textContent = "";
    this.style.borderColor = this.value ? "#28a745" : "";
  }
});

function mostrarError(msg, fieldId = null) {
  // Limpiar errores previos
  document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
  
  if (fieldId) {
    // Mostrar error en campo específico
    const errorEl = document.getElementById(`e-${fieldId}`);
    if (errorEl) {
      errorEl.textContent = msg;
      document.getElementById(fieldId).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } else {
    // Mostrar error general
    const successMsg = document.getElementById("success-msg");
    successMsg.textContent = msg;
    successMsg.style.color = "#dc3545";
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function mostrarExito(msg) {
  // Limpiar errores previos
  document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
  
  const successMsg = document.getElementById("success-msg");
  successMsg.textContent = msg;
  successMsg.style.color = "#28a745";
  successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function limpiarMensajes() {
  document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
  const successMsg = document.getElementById("success-msg");
  successMsg.textContent = "";
  successMsg.style.color = "";
}