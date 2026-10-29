// Reglas de negocio del caso (están en el ERS). Son funciones puras: no tocan la pantalla.
//  - Mayores de 50 años: 50% de descuento en todos los productos.
//  - Código FELICES50 al registrarse: 10% de descuento de por vida.
//  - Estudiantes Duoc (correo institucional): torta gratis el día de su cumpleaños.
// Los descuentos NO se acumulan: se aplica el mayor.
import { calcularTotal } from './carrito.js'

export const CODIGO_PROMOCIONAL = 'FELICES50'
const DOMINIOS_DUOC = ['@duoc.cl', '@profesor.duoc.cl']

// "1976-10-20" -> { anio: 1976, mes: 10, dia: 20 }. Se separa a mano (sin new Date)
// para que la zona horaria no cambie el día.
function partesDeFecha(fecha) {
  const [anio, mes, dia] = String(fecha).split('-').map(Number)
  return [anio, mes, dia].some(Number.isNaN) ? null : { anio, mes, dia }
}

// Años cumplidos a la fecha "hoy" (o null si no hay fecha de nacimiento válida)
export function calcularEdad(fechaNacimiento, hoy = new Date()) {
  const f = fechaNacimiento ? partesDeFecha(fechaNacimiento) : null
  if (!f) return null
  const mesHoy = hoy.getMonth() + 1
  const aunNoCumple = mesHoy < f.mes || (mesHoy === f.mes && hoy.getDate() < f.dia)
  return hoy.getFullYear() - f.anio - (aunNoCumple ? 1 : 0)
}

export function esCumpleanos(usuario, hoy = new Date()) {
  const f = usuario?.fechaNacimiento ? partesDeFecha(usuario.fechaNacimiento) : null
  return Boolean(f) && f.mes === hoy.getMonth() + 1 && f.dia === hoy.getDate()
}

export function esCorreoDuoc(correo = '') {
  return DOMINIOS_DUOC.some((dominio) => correo.trim().toLowerCase().endsWith(dominio))
}

// { porcentaje, motivo } del mejor descuento que le corresponde al usuario
export function descuentoDe(usuario, hoy = new Date()) {
  const opciones = []
  if (usuario) {
    const edad = calcularEdad(usuario.fechaNacimiento, hoy)
    if (edad !== null && edad >= 50) opciones.push({ porcentaje: 50, motivo: 'Descuento por tener 50 años o más' })
    if ((usuario.codigo ?? '').trim().toUpperCase() === CODIGO_PROMOCIONAL) {
      opciones.push({ porcentaje: 10, motivo: 'Código FELICES50 (10% de por vida)' })
    }
  }
  return opciones.sort((a, b) => b.porcentaje - a.porcentaje)[0] ?? { porcentaje: 0, motivo: '' }
}

export function tieneTortaGratis(usuario, hoy = new Date()) {
  return Boolean(usuario) && esCorreoDuoc(usuario.correo) && esCumpleanos(usuario, hoy)
}

// Resumen para mostrar y cobrar: { subtotal, porcentaje, motivo, descuento, total, regalo }
export function calcularTotales(carrito, usuario, hoy = new Date()) {
  const subtotal = calcularTotal(carrito)
  const { porcentaje, motivo } = descuentoDe(usuario, hoy)
  const descuento = Math.round((subtotal * porcentaje) / 100)
  return {
    subtotal,
    porcentaje,
    motivo,
    descuento,
    total: subtotal - descuento,
    regalo: tieneTortaGratis(usuario, hoy) ? 'Torta de cumpleaños gratis (estudiante Duoc)' : '',
  }
}
