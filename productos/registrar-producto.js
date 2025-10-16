const API_URL = "https://recirculate-api.onrender.com/api/productos";

document.getElementById("formProducto").addEventListener("submit", async (e) => {
  e.preventDefault();
  limpiarMensajes();

  const nombre = document.getElementById("nombre").value.trim();
  const stock = Number(document.getElementById("stock").value);
  const precio = Number(document.getElementById("precio").value);

  if (!nombre || stock < 0 || precio < 0) {
    mostrarError("Completa todos los campos correctamente.");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, stock, precio })
    });
    if (!res.ok) throw new Error("Error al guardar el producto");
    mostrarExito("Producto guardado correctamente ✅");
    document.getElementById("formProducto").reset();
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