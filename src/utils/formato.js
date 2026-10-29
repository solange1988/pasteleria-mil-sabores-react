// 45000 -> "$45.000"
function formatearPrecio(valor) {
  return valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })
}

// "Pastelería Tradicional" -> "pasteleria-tradicional" (sirve para armar la URL #/categorias/...)
export function crearSlug(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita las tildes
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// precio 50000 y oferta 42500 -> 15 (porcentaje de descuento de la oferta)
export function porcentajeOferta(precio, precioOferta) {
  if (!precioOferta || precioOferta <= 0 || precioOferta >= precio) return 0
  return Math.round((1 - precioOferta / precio) * 100)
}

// "2026-10-24T12:00:00.000Z" -> fecha y hora legibles en Chile
export function formatearFecha(iso) {
  return new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
}

export default formatearPrecio
