// Cálculos del panel de reportes (funciones puras sobre la lista de órdenes).
const RECHAZADA = 'Pago rechazado'

// { cantidadOrdenes, rechazadas, totalVentas, ticketPromedio }
export function resumenVentas(ordenes) {
  const validas = ordenes.filter((o) => o.estado !== RECHAZADA)
  const totalVentas = validas.reduce((suma, o) => suma + o.total, 0)
  return {
    cantidadOrdenes: validas.length,
    rechazadas: ordenes.length - validas.length,
    totalVentas,
    ticketPromedio: validas.length ? Math.round(totalVentas / validas.length) : 0,
  }
}

// [{ nombre, unidades }] de mayor a menor, solo con órdenes pagadas
export function productosMasVendidos(ordenes, cantidad = 3) {
  const conteo = {}
  ordenes
    .filter((o) => o.estado !== RECHAZADA)
    .forEach((o) => o.lineas.forEach((l) => { conteo[l.nombre] = (conteo[l.nombre] ?? 0) + l.cantidad }))
  return Object.entries(conteo)
    .map(([nombre, unidades]) => ({ nombre, unidades }))
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, cantidad)
}
