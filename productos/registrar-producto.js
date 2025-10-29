const API_URL = "https://recirculate-api.onrender.com/api/productos";

// Variables globales
let generoSeleccionado = null;
let datosProductoTemp = null;

document.getElementById("formProducto").addEventListener("submit", async (e) => {
  e.preventDefault();
  limpiarMensajes();

  console.log("🚀 Iniciando proceso de guardado...");

  // Obtener todos los valores del formulario
  const nombre = document.getElementById("nombre").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const genero = document.getElementById("genero").value; // USAR SELECT DIRECTO
  const estado = document.getElementById("estado").value;
  const talle = document.getElementById("talle").value.trim();
  const color = document.getElementById("color").value.trim();
  const marca = document.getElementById("marca").value.trim();
  const precio = Number(document.getElementById("precio").value);
  const stock = Number(document.getElementById("stock").value);
  const imagen_url = document.getElementById("imagen_url").value.trim();
  const proveedor = document.getElementById("proveedor").value.trim();
  const destacado = document.getElementById("destacado").checked;

  console.log("📝 Datos del formulario:", { nombre, genero, estado, precio, stock });

  // Validaciones básicas
  if (!nombre) {
    mostrarError("El nombre es obligatorio.");
    return;
  }
  
  if (!genero) {
    mostrarError("Debe seleccionar el género del producto.");
    return;
  }
  
  if (!estado) {
    mostrarError("Debe seleccionar el estado del producto.");
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
  
  // Preparar datos para enviar DIRECTAMENTE
  const productoData = {
    nombre,
    descripcion: descripcion || null,
    categoria: categoria || null,
    genero, // USAR GÉNERO DEL SELECT
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
  
  console.log("✅ Todas las validaciones pasaron, procediendo a guardar...");
  await guardarProductoDirectamente(productoData);
});

// Función SIMPLIFICADA para guardar producto
async function guardarProductoDirectamente(productoData) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      mostrarError("Debe estar autenticado para crear productos.");
      return;
    }

    console.log("📤 Enviando datos al servidor:", productoData);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(productoData)
    });
    
    console.log("📡 Respuesta del servidor:", res.status, res.statusText);
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ Error del servidor:", errorData);
      throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
    }

    const nuevoProducto = await res.json();
    mostrarExito("¡Producto guardado exitosamente!");
    
    // Limpiar formulario
    document.getElementById("formProducto").reset();
    document.getElementById("destacado").checked = true;
    
    console.log("✅ Producto creado:", nuevoProducto);
  } catch (err) {
    console.error("❌ Error guardando producto:", err);
    mostrarError(err.message);
  }
}

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

// --- FUNCIONES DEL POPUP DE GÉNERO ---
function mostrarPopupGenero() {
  console.log("🎯 Mostrando popup de género...");
  const popup = document.getElementById('generoPopup');
  if (popup) {
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    console.log("✅ Popup mostrado correctamente");
  } else {
    console.error("❌ No se encontró el elemento del popup");
  }
}

function cerrarPopupGenero() {
  console.log("❌ Cerrando popup de género...");
  const popup = document.getElementById('generoPopup');
  if (popup) {
    popup.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

function seleccionarGenero(genero) {
  console.log(`🎯 Género seleccionado: ${genero}`);
  generoSeleccionado = genero;
  cerrarPopupGenero();
  
  // Mostrar confirmación
  mostrarExito(`Género seleccionado: ${genero}. Guardando producto...`);
  
  // Proceder a guardar automáticamente
  setTimeout(async () => {
    console.log("🔄 Guardando producto con género seleccionado...");
    await guardarProductoConGenero();
  }, 1000);
}

// Inicializar campos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  // Destacar visualmente los campos obligatorios
  const camposObligatorios = ['nombre', 'estado', 'precio', 'stock'];
  
  camposObligatorios.forEach(campoId => {
    const campo = document.getElementById(campoId);
    if (campo) {
      campo.style.borderColor = '#ff9999';
      campo.style.borderWidth = '2px';
      
      // Cuando el usuario selecciona algo, cambiar a verde
      campo.addEventListener('change', function() {
        if (this.value) {
          this.style.borderColor = '#99ff99';
        } else {
          this.style.borderColor = '#ff9999';
        }
      });
    }
  });
  
  // Configurar botones del popup de género
  document.querySelectorAll('.genero-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const genero = this.getAttribute('data-genero');
      seleccionarGenero(genero);
    });
  });
  
  // Mensaje informativo
  console.log('✅ Formulario de productos inicializado con popup de género');
});