// Validación de Ventas 
export function validarVenta(venta, productos) {
  if (!venta.cliente || !venta.producto) {
    return "El cliente y el producto son obligatorios.";
  }
  if (!venta.cantidad || venta.cantidad < 1) {
    return "La cantidad debe ser mayor a 0.";
  }
  if (!venta.metodoPago) {
    return "Selecciona un método de pago.";
  }

  // Buscar producto por id (puede ser string o número)
  const producto = productos.find(
    p => (p._id || p.id || p.nombre) == venta.producto
  );
  if (!producto) {
    return "Producto no encontrado.";
  }
  if (venta.cantidad > producto.stock) {
    return "No hay suficiente stock.";
  }

  return true;
}

// Validación de Gastos 
export function validarGasto(gasto) {
  if (!gasto.proveedor) {
    return "El proveedor es obligatorio.";
  }
  if (!gasto.monto || gasto.monto < 1) {
    return "El monto debe ser mayor a 0.";
  }
  if (!gasto.metodoPago) {
    return "Selecciona un método de pago.";
  }
  return true;
}
