// "Base de datos" simulada de órdenes de compra (se guarda en localStorage).
// Cada orden: { numero, fecha, correo, cliente, direccion, lineas, subtotal, descuento,
//               motivo, total, regalo, estado }

const CLAVE = 'pms_ordenes_v1'
const PRIMER_NUMERO = 1001

export const ESTADOS = ['Pagada', 'En preparación', 'Enviada', 'Entregada', 'Pago rechazado']

function leer() {
  const guardado = localStorage.getItem(CLAVE)
  return guardado ? JSON.parse(guardado) : []
}

function guardar(lista) {
  localStorage.setItem(CLAVE, JSON.stringify(lista))
}

// ---------- CRUD ----------

// Crear: el número de orden es el mayor + 1 (empieza en 1001)
export function crearOrden({ correo, cliente, direccion, lineas, totales, estado = 'Pagada' }) {
  const lista = leer()
  const numero = lista.length ? Math.max(...lista.map((o) => o.numero)) + 1 : PRIMER_NUMERO
  const orden = {
    numero,
    fecha: new Date().toISOString(),
    correo,
    cliente,
    direccion,
    lineas: lineas.map(({ id, nombre, precio, cantidad }) => ({ id, nombre, precio, cantidad })),
    subtotal: totales.subtotal,
    descuento: totales.descuento,
    motivo: totales.motivo,
    total: totales.total,
    regalo: totales.regalo,
    estado,
  }
  guardar([...lista, orden])
  return orden
}

// Leer
export function listarOrdenes() {
  return leer()
}

export function listarOrdenesDe(correo) {
  return leer().filter((o) => o.correo.toLowerCase() === correo.toLowerCase())
}

export function obtenerOrden(numero) {
  return leer().find((o) => o.numero === Number(numero))
}

// Actualizar (el administrador cambia el estado de la orden)
export function cambiarEstadoOrden(numero, estado) {
  const lista = leer().map((o) => (o.numero === Number(numero) ? { ...o, estado } : o))
  guardar(lista)
  return lista.find((o) => o.numero === Number(numero))
}

// Eliminar
export function eliminarOrden(numero) {
  guardar(leer().filter((o) => o.numero !== Number(numero)))
}

export function reiniciarOrdenes() {
  localStorage.removeItem(CLAVE)
}
