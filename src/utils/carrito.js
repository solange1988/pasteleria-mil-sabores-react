// Lógica del carrito como funciones puras: reciben el carrito y devuelven uno NUEVO.
// React necesita un arreglo nuevo para notar el cambio de estado (no se modifica el original).
// Cada línea del carrito: { id, nombre, precio, imagen, cantidad }

// El precio que se cobra: el de oferta si el producto tiene una, si no el normal
export function precioVigente(producto) {
  return producto.precioOferta > 0 && producto.precioOferta < producto.precio ? producto.precioOferta : producto.precio
}

export function agregarAlCarrito(carrito, producto) {
  const existe = carrito.find((linea) => linea.id === producto.id)
  if (existe) {
    return carrito.map((linea) =>
      linea.id === producto.id ? { ...linea, cantidad: linea.cantidad + 1 } : linea,
    )
  }
  const { id, nombre, imagen } = producto
  return [...carrito, { id, nombre, precio: precioVigente(producto), imagen, cantidad: 1 }]
}

export function quitarDelCarrito(carrito, id) {
  return carrito.filter((linea) => linea.id !== id)
}

// Si la cantidad baja de 1, la línea se elimina
export function cambiarCantidad(carrito, id, cantidad) {
  if (cantidad < 1) return quitarDelCarrito(carrito, id)
  return carrito.map((linea) => (linea.id === id ? { ...linea, cantidad } : linea))
}

export function calcularTotal(carrito) {
  return carrito.reduce((total, linea) => total + linea.precio * linea.cantidad, 0)
}

export function contarUnidades(carrito) {
  return carrito.reduce((total, linea) => total + linea.cantidad, 0)
}
