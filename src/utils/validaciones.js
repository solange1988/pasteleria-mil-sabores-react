// Las mismas reglas de validaciones.js, validaciones-login.js y validaciones-registro.js,
// ahora como funciones puras (sin tocar el DOM) para poder usarlas en React y probarlas.
// Todas devuelven { valido: true } o { valido: false, mensaje: '...' }

const OK = { valido: true }
const error = (mensaje) => ({ valido: false, mensaje })

const DOMINIOS_PERMITIDOS = /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/
const CORREO_GENERAL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const SOLO_LETRAS = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/

// ---------- Login y registro ----------

export function validarCorreoPermitido(valor) {
  const texto = valor.trim()
  if (texto === '') return error('El correo es obligatorio')
  if (texto.length > 100) return error('Máximo 100 caracteres')
  if (!DOMINIOS_PERMITIDOS.test(texto)) return error('Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com')
  return OK
}

export function validarContrasena(valor) {
  if (valor === '') return error('La contraseña es obligatoria')
  if (valor.length < 4 || valor.length > 10) return error('Debe tener entre 4 y 10 caracteres')
  return OK
}

export function validarNombreCompleto(valor) {
  const texto = valor.trim()
  if (texto === '') return error('El nombre es obligatorio')
  if (texto.length > 50) return error('Máximo 50 caracteres')
  return OK
}

export function validarConfirmacion(valor, original, campo) {
  if (valor.trim() === '') return error(`Debes confirmar tu ${campo}`)
  if (valor.trim() !== original.trim()) return error(`Los valores de ${campo} no coinciden`)
  return OK
}

// ---------- Contacto y checkout ----------

export function validarNombre(valor) {
  const texto = valor.trim()
  if (texto === '') return error('Este campo es obligatorio')
  if (texto.length < 3) return error('Debe tener al menos 3 caracteres')
  if (!SOLO_LETRAS.test(texto)) return error('Solo se permiten letras y espacios')
  return OK
}

export function validarCorreo(valor) {
  const texto = valor.trim()
  if (texto === '') return error('El correo es obligatorio')
  if (!CORREO_GENERAL.test(texto)) return error('Escribe un correo válido, por ejemplo nombre@correo.com')
  return OK
}

export function validarMensaje(valor) {
  const texto = valor.trim()
  if (texto === '') return error('El mensaje no puede estar vacío')
  if (texto.length < 10) return error('Cuéntanos un poco más (mínimo 10 caracteres)')
  if (texto.length > 500) return error('El mensaje es muy largo (máximo 500 caracteres)')
  return OK
}

export function validarRequerido(valor) {
  return String(valor).trim() === '' ? error('Este campo es obligatorio') : OK
}

// ---------- Admin ----------

export function validarNumeroPositivo(valor) {
  if (String(valor).trim() === '') return error('Este campo es obligatorio')
  const numero = Number(valor)
  if (!Number.isInteger(numero) || numero < 0) return error('Debe ser un número entero mayor o igual a 0')
  return OK
}

// ---------- Registro y perfil (opcionales) ----------

// Opcional: si se escribe, debe ser una fecha real que no sea futura
export function validarFechaNacimiento(valor) {
  if (String(valor).trim() === '') return OK
  const fecha = new Date(`${valor}T00:00:00`)
  if (Number.isNaN(fecha.getTime())) return error('La fecha no es válida')
  if (fecha > new Date()) return error('La fecha no puede ser futura')
  if (fecha.getFullYear() < 1900) return error('La fecha no es válida')
  return OK
}

// Opcional: si se escribe, solo existe el código FELICES50
export function validarCodigoPromocional(valor) {
  const texto = String(valor).trim()
  if (texto === '') return OK
  return texto.toUpperCase() === 'FELICES50' ? OK : error('El código promocional no es válido')
}

// Opcional: si se escribe, debe ser un entero y menor que el precio normal
export function validarPrecioOferta(valor, precio) {
  if (String(valor).trim() === '') return OK
  const numero = Number(valor)
  if (!Number.isInteger(numero) || numero < 0) return error('Debe ser un número entero mayor o igual a 0')
  if (numero > 0 && numero >= Number(precio)) return error('La oferta debe ser menor al precio normal')
  return OK
}
