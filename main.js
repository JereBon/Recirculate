import { validarVenta, validarGasto } from "./validaciones.js";

// (tienda de ropa)
let productos = [
  { id: 1, nombre: "Remera", stock: 20 },
  { id: 2, nombre: "Psa", stock: 10 },
  { id: 4, nombre: "Chaqantalón", stock: 15 },
  { id: 3, nombre: "Boxer", stock: 5 },
];

// --- Llenar select de productos ---
const selectProducto = document.getElementById("producto");
productos.forEach(p => {
  const option = document.createElement("option");
  option.value = p.id;
  option.textContent = `${p.nombre} (Stock: ${p.stock})`;
  selectProducto.appendChild(option);
});

//  Formulario de Ventas
const formVenta = document.getElementById("formVenta");
const errorVenta = document.getElementById("errorVenta");
const successVenta = document.getElementById("successVenta");

formVenta.addEventListener("submit", (e) => {
  e.preventDefault();
  errorVenta.textContent = "";
  successVenta.textContent = "";

  const venta = {
    cliente: document.getElementById("cliente").value,
    productoId: document.getElementById("producto").value,
    cantidad: Number(document.getElementById("cantidad").value),
    metodoPago: document.getElementById("metodoPago").value
  };

  const resultado = validarVenta(venta, productos);
  if (resultado !== true) {
    errorVenta.textContent = resultado;
    return;
  }

  // Guardar en localStorage
  let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
  ventas.push(venta);
  localStorage.setItem("ventas", JSON.stringify(ventas));

  // Restar stock
  const producto = productos.find(p => p.id === Number(venta.productoId));
  producto.stock -= venta.cantidad;
  // Actualizar select con nuevo stock
  selectProducto.options[selectProducto.selectedIndex].textContent = `${producto.nombre} (Stock: ${producto.stock})`;

  successVenta.textContent = "Venta guardada correctamente ✅";
  formVenta.reset();
});

// Formulario de Gastos 
const formGasto = document.getElementById("formGasto");
const errorGasto = document.getElementById("errorGasto");
const successGasto = document.getElementById("successGasto");

formGasto.addEventListener("submit", (e) => {
  e.preventDefault();
  errorGasto.textContent = "";
  successGasto.textContent = "";

  const gasto = {
    proveedor: document.getElementById("proveedor").value,
    monto: Number(document.getElementById("monto").value),
    metodoPago: document.getElementById("metodoPagoGasto").value
  };

  const resultado = validarGasto(gasto);
  if (resultado !== true) {
    errorGasto.textContent = resultado;
    return;
  }

  // Guardar en localStorage
  let gastos = JSON.parse(localStorage.getItem("gastos")) || [];
  gastos.push(gasto);
  localStorage.setItem("gastos", JSON.stringify(gastos));

  successGasto.textContent = "Gasto guardado correctamente ✅";
  formGasto.reset();
});






// posible integracion con el front:  

//  const resultado = validarVenta(venta);
//  if (resultado === true) {
//    guardarVenta(venta);
//  } else {
//    mostrarError(resultado);
//  }