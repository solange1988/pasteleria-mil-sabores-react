// "Base de datos" simulada de usuarios (se guarda en localStorage).
// Cada usuario: { nombre, correo, contrasena, rol, fechaNacimiento, codigo, telefono, region, comuna }
// OJO: en una aplicación real la contraseña NUNCA se guarda en texto plano ni en el navegador;
// aquí es solo una simulación para poder probar el inicio de sesión sin backend.

const CLAVE = 'pms_usuarios_v1'

export const ROLES = ['Administrador', 'Cliente']

// Cuenta que existe desde el inicio para poder entrar al panel de administración
const ADMINISTRADOR = {
  nombre: 'Administrador Pastelería',
  correo: 'admin@duoc.cl',
  contrasena: 'admin123',
  rol: 'Administrador',
  fechaNacimiento: '',
  codigo: '',
  telefono: '',
  region: '',
  comuna: '',
}

function leer() {
  const guardado = localStorage.getItem(CLAVE)
  return guardado ? JSON.parse(guardado) : [ADMINISTRADOR]
}

function guardar(lista) {
  localStorage.setItem(CLAVE, JSON.stringify(lista))
}

const mismoCorreo = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase()

// Lo que sale de este archivo nunca incluye la contraseña
function sinContrasena({ contrasena, ...resto }) { // eslint-disable-line no-unused-vars
  return resto
}

// ---------- CRUD ----------

// Leer
export function listarUsuarios() {
  return leer().map(sinContrasena)
}

export function obtenerUsuario(correo) {
  const usuario = leer().find((u) => mismoCorreo(u.correo, correo))
  return usuario ? sinContrasena(usuario) : undefined
}

export function existeCorreo(correo) {
  return leer().some((u) => mismoCorreo(u.correo, correo))
}

// Crear: devuelve { ok: true, usuario } o { ok: false, mensaje }
export function registrarUsuario(datos) {
  if (existeCorreo(datos.correo)) return { ok: false, mensaje: 'Ese correo ya está registrado.' }
  const nuevo = {
    nombre: '', fechaNacimiento: '', codigo: '', telefono: '', region: '', comuna: '',
    rol: 'Cliente',
    ...datos,
    correo: datos.correo.trim(),
  }
  guardar([...leer(), nuevo])
  return { ok: true, usuario: sinContrasena(nuevo) }
}

// Actualizar: cambia solo los campos indicados (el correo identifica al usuario y no cambia)
export function actualizarUsuario(correo, cambios) {
  let actualizado
  guardar(
    leer().map((u) => {
      if (!mismoCorreo(u.correo, correo)) return u
      actualizado = { ...u, ...cambios, correo: u.correo }
      return actualizado
    }),
  )
  return actualizado ? sinContrasena(actualizado) : undefined
}

// Eliminar
export function eliminarUsuario(correo) {
  guardar(leer().filter((u) => !mismoCorreo(u.correo, correo)))
}

// Vuelve al estado inicial (solo la cuenta de administrador)
export function reiniciarUsuarios() {
  localStorage.removeItem(CLAVE)
}

// ---------- Inicio de sesión ----------

// Devuelve el usuario si el correo y la contraseña coinciden; si no, null
export function autenticar(correo, contrasena) {
  const usuario = leer().find((u) => mismoCorreo(u.correo, correo) && u.contrasena === contrasena)
  return usuario ? sinContrasena(usuario) : null
}
