const API_URL = "https://recirculate-api.onrender.com/api/productos";
const UPLOAD_URL = "https://recirculate-api.onrender.com/api/upload";

// ===== SISTEMA DE SUBIDA DE IMÁGENES =====
let imageUrls = {
  frente: null,
  espalda: null
};

// Inicializar sistema de drag & drop cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
  initializeImageUpload();
});

function initializeImageUpload() {
  // Configurar drag & drop para ambas zonas
  ['frente', 'espalda'].forEach(type => {
    const uploadZone = document.getElementById(`upload-${type}`);
    const fileInput = document.getElementById(`file-${type}`);
    
    // Click para abrir selector de archivos
    uploadZone.addEventListener('click', () => {
      if (!uploadZone.querySelector('.image-preview').style.display.includes('block')) {
        fileInput.click();
      }
    });
    
    // Cambio en input de archivo
    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        handleImageUpload(e.target.files[0], type);
      }
    });
    
    // Eventos de drag & drop
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragenter', handleDragEnter);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', (e) => handleDrop(e, type));
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
}

function handleDragEnter(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  if (!e.currentTarget.contains(e.relatedTarget)) {
    e.currentTarget.classList.remove('drag-over');
  }
}

function handleDrop(e, type) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      handleImageUpload(file, type);
    } else {
      alert('Por favor, sube solo archivos de imagen.');
    }
  }
}

async function handleImageUpload(file, type) {
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    alert('Por favor, selecciona un archivo de imagen válido.');
    return;
  }
  
  // Validar tamaño (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen es muy grande. El tamaño máximo es 5MB.');
    return;
  }
  
  // Mostrar vista previa inmediata
  showImagePreview(file, type);
  
  // Mostrar progreso de subida
  showUploadProgress(type, true);
  
  try {
    // Preparar FormData para Cloudinary
    const formData = new FormData();
    formData.append('imagen', file);
    
    // Subir a Cloudinary
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Error al subir la imagen');
    }
    
    const result = await response.json();
    
    // Guardar URL de Cloudinary
    imageUrls[type] = result.url;
    
    // Ocultar progreso y mostrar éxito
    showUploadProgress(type, false);
    document.getElementById(`upload-${type}`).classList.add('success');
    
    console.log(`✅ Imagen ${type} subida:`, result.url);
    
  } catch (error) {
    console.error('Error al subir imagen:', error);
    showUploadProgress(type, false);
    document.getElementById(`upload-${type}`).classList.add('error');
    alert(`Error al subir la imagen de ${type}. Inténtalo de nuevo.`);
    
    // Limpiar vista previa si falló la subida
    removeImage(type);
  }
}

function showImagePreview(file, type) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById(`preview-${type}`);
    const img = document.getElementById(`img-${type}`);
    const uploadContent = document.querySelector(`#upload-${type} .upload-content`);
    
    img.src = e.target.result;
    preview.style.display = 'block';
    uploadContent.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function showUploadProgress(type, show) {
  const progress = document.getElementById(`progress-${type}`);
  progress.style.display = show ? 'flex' : 'none';
  
  if (show) {
    // Animar barra de progreso
    const progressFill = progress.querySelector('.progress-fill');
    progressFill.style.width = '0%';
    
    setTimeout(() => {
      progressFill.style.width = '70%';
    }, 100);
    
    setTimeout(() => {
      progressFill.style.width = '100%';
    }, 1000);
  }
}

function removeImage(type) {
  // Limpiar URL guardada
  imageUrls[type] = null;
  
  // Resetear elementos visuales
  const uploadZone = document.getElementById(`upload-${type}`);
  const preview = document.getElementById(`preview-${type}`);
  const uploadContent = document.querySelector(`#upload-${type} .upload-content`);
  const fileInput = document.getElementById(`file-${type}`);
  
  preview.style.display = 'none';
  uploadContent.style.display = 'flex';
  fileInput.value = '';
  
  // Limpiar clases de estado
  uploadZone.classList.remove('success', 'error');
  
  console.log(`🗑️ Imagen ${type} eliminada`);
}

// ===== FORMULARIO PRINCIPAL =====

// --- SOPORTE EDICIÓN DE PRODUCTO ---
document.addEventListener('DOMContentLoaded', () => {
  // Si hay id en la URL, cargar datos y usar PUT en submit
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');
  if (editId) {
    fetch(`${API_URL}/${editId}`)
      .then(res => res.json())
      .then(prod => {
        if (prod) {
          document.getElementById('nombre').value = prod.nombre || '';
          document.getElementById('categoria').value = prod.categoria || '';
          document.getElementById('genero').value = prod.genero || '';
          document.getElementById('talle').value = prod.talle || '';
          document.getElementById('color').value = prod.color || '';
          document.getElementById('marca').value = prod.marca || '';
          document.getElementById('precio').value = prod.precio || '';
          document.getElementById('stock').value = prod.stock || '';
          document.getElementById('descuento').value = prod.descuento || '';
          document.getElementById('proveedor').value = prod.proveedor || '';
          document.getElementById('descripcion').value = prod.descripcion || '';
          // Cargar imágenes si existen
          if (prod.imagen_url) {
            imageUrls.frente = prod.imagen_url;
            document.getElementById('img-frente').src = prod.imagen_url;
            document.getElementById('preview-frente').style.display = 'block';
            document.querySelector('#upload-frente .upload-content').style.display = 'none';
          }
          if (prod.imagen_hover) {
            imageUrls.espalda = prod.imagen_hover;
            document.getElementById('img-espalda').src = prod.imagen_hover;
            document.getElementById('preview-espalda').style.display = 'block';
            document.querySelector('#upload-espalda .upload-content').style.display = 'none';
          }
        }
      });
  }

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
    if (!imageUrls.frente || !imageUrls.espalda) {
      mostrarError("Debes subir ambas imágenes: frente y espalda del producto.", "imagenes");
      return;
    }

    // Preparar datos para enviar
    const productData = {
      nombre,
      descripcion: descripcion || null,
      categoria,
      genero,
      talle: talle || null,
      color: color || null,
      marca: marca || null,
      precio,
      stock,
      descuento,
      proveedor: proveedor || null,
      imagen_url: imageUrls.frente,
      imagen_hover: imageUrls.espalda,
      imagen_espalda_url: imageUrls.espalda,
      estado: stock > 0 ? 'Disponible' : 'Sin stock'
    };

    try {
      let res;
      if (editId) {
        // Modo edición: PUT
        res = await fetch(`${API_URL}/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(productData)
        });
      } else {
        // Modo alta: POST
        res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(productData)
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al guardar el producto");
      }

      mostrarExito(`Producto "${nombre}" ${editId ? 'actualizado' : 'guardado'} correctamente ✅`);
      document.getElementById("formProducto").reset();
      removeImage('frente');
      removeImage('espalda');
      setTimeout(() => {
        window.location.href = 'ver-productos.html';
      }, 2000);
    } catch (err) {
      mostrarError(`Error al guardar: ${err.message}`);
    }
  });
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

// Validación de imágenes en tiempo real
function validateImages() {
  const errorEl = document.getElementById("e-imagenes");
  if (!imageUrls.frente || !imageUrls.espalda) {
    errorEl.textContent = "Debes subir ambas imágenes del producto";
    return false;
  } else {
    errorEl.textContent = "";
    return true;
  }
}

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